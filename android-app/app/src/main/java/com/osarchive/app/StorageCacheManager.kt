package com.osarchive.app

import android.content.Context
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import okhttp3.ConnectionPool
import okhttp3.Dispatcher
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

class StorageCacheManager(private val context: Context) {

    companion object {
        const val MAX_CACHE_BYTES: Long = 2048L * 1024L * 1024L // 2GB 预设上限
        const val BASE_URL = "https://ricky2036.github.io/os_updates_archive"
        const val MANIFEST_PATH = "manifests/app-manifest.json"
        private const val STATE_FILE_NAME = "offline_state_v2.json"

        @Volatile
        private var instance: StorageCacheManager? = null

        fun getInstance(context: Context): StorageCacheManager {
            return instance ?: synchronized(this) {
                instance ?: StorageCacheManager(context.applicationContext).also { instance = it }
            }
        }

        fun normalizeUrl(rawUrl: String): String {
            var u = rawUrl.trim()
            if (u.isEmpty()) return BASE_URL + "/"
            u = u.substringBefore("#").substringBefore("?").substringBefore(";")

            val githubRoot = "https://ricky2036.github.io"
            if (u.startsWith(githubRoot) && !u.startsWith(BASE_URL)) {
                val sub = u.removePrefix(githubRoot).removePrefix("/")
                u = "$BASE_URL/$sub"
            } else if (!u.startsWith("http://") && !u.startsWith("https://")) {
                val sub = u.removePrefix("/os_updates_archive/").removePrefix("/")
                u = if (sub.isEmpty()) "$BASE_URL/" else "$BASE_URL/$sub"
            }

            if (u.startsWith(BASE_URL)) {
                var sub = u.removePrefix(BASE_URL).removePrefix("/")
                if (sub.endsWith("/index.html")) {
                    sub = sub.removeSuffix("index.html")
                } else if (sub == "index.html") {
                    sub = ""
                }
                if (sub.isEmpty()) {
                    return "$BASE_URL/"
                }
                val lastSegment = sub.substringAfterLast("/")
                val hasExtension = lastSegment.contains(".")
                if (!hasExtension && !sub.endsWith("/")) {
                    sub = "$sub/"
                }
                return "$BASE_URL/$sub"
            }

            return u
        }

        fun hashNormalizedUrl(rawUrl: String): String {
            val normalized = normalizeUrl(rawUrl)
            val digest = MessageDigest.getInstance("SHA-256")
            val hash = digest.digest(normalized.toByteArray(Charsets.UTF_8))
            return hash.joinToString("") { "%02x".format(it) }
        }
    }

    // 高并发多连接 OkHttpClient
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .connectionPool(ConnectionPool(32, 5, TimeUnit.MINUTES))
        .dispatcher(Dispatcher().apply {
            maxRequests = 64
            maxRequestsPerHost = 32
        })
        .build()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    val webCacheDir: File by lazy {
        File(context.cacheDir, "web_cache").apply { mkdirs() }
    }

    val offlinePackDir: File by lazy {
        File(context.filesDir, "offline_pack").apply { mkdirs() }
    }

    private val stateFile: File by lazy {
        File(context.filesDir, STATE_FILE_NAME)
    }

    data class ArticleMeta(
        val id: String,
        val order: Int,
        val title: String,
        val brand: String,
        val year: Int,
        val slug: String,
        val route: String,
        val publishedAt: String,
        val kind: String,
        val hasDigest: Boolean,
        val cover: String,
        val estimatedBytes: Long,
        val assets: List<String>
    )

    data class BrandMeta(
        val id: String,
        val title: String,
        val subtitle: String,
        val route: String,
        val accent: String,
        val soft: String,
        val logo: String,
        val articleCount: Int,
        val estimatedBytes: Long
    )

    data class ArticleOfflineState(
        val status: String, // "none" | "downloading" | "ready" | "error"
        val progress: Int,  // 0..100
        val downloadedBytes: Long,
        val updatedAt: Long
    )

    data class TaskProgress(
        val taskId: String,
        val label: String,
        val currentTitle: String,
        val percent: Int,
        val completedCount: Int,
        val totalCount: Int,
        val isRunning: Boolean
    )

    @Volatile
    private var cachedManifestJson: JSONObject? = null
    private val articlesBySlug = ConcurrentHashMap<String, ArticleMeta>()
    private val brandsById = ConcurrentHashMap<String, BrandMeta>()
    private val coreAssets = mutableListOf<String>()
    private val articleStates = ConcurrentHashMap<String, ArticleOfflineState>()

    @Volatile
    private var activeTask: TaskProgress? = null
    private var activeJob: Job? = null
    private var stateListener: ((String) -> Unit)? = null
    private var taskProgressListener: ((TaskProgress?) -> Unit)? = null

    init {
        loadManifestSync()
        loadStateSync()
    }

    fun setOnStateChangeListener(listener: (String) -> Unit) {
        this.stateListener = listener
    }

    fun setOnTaskProgressListener(listener: (TaskProgress?) -> Unit) {
        this.taskProgressListener = listener
    }

    private fun notifyStateChanged() {
        val listener = stateListener ?: return
        try {
            listener(buildFullStateJsonString())
        } catch (_: Exception) {}
    }

    private fun updateActiveTask(task: TaskProgress?) {
        activeTask = task
        taskProgressListener?.invoke(task)
        notifyStateChanged()
    }

    @Synchronized
    private fun loadManifestSync() {
        try {
            val raw = context.assets.open("app-manifest.json").bufferedReader().use { it.readText() }
            parseManifest(JSONObject(raw))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @Synchronized
    private fun parseManifest(json: JSONObject) {
        cachedManifestJson = json
        coreAssets.clear()
        json.optJSONArray("coreAssets")?.let { arr ->
            for (i in 0 until arr.length()) {
                coreAssets.add(arr.optString(i))
            }
        }

        brandsById.clear()
        json.optJSONArray("brands")?.let { arr ->
            for (i in 0 until arr.length()) {
                val b = arr.getJSONObject(i)
                val id = b.optString("id")
                brandsById[id] = BrandMeta(
                    id = id,
                    title = b.optString("title"),
                    subtitle = b.optString("subtitle"),
                    route = b.optString("route"),
                    accent = b.optString("accent", "#00a99d"),
                    soft = b.optString("soft", "#dff6f2"),
                    logo = b.optString("logo"),
                    articleCount = b.optInt("articleCount", 0),
                    estimatedBytes = b.optLong("estimatedBytes", 0L)
                )
            }
        }

        articlesBySlug.clear()
        json.optJSONArray("articles")?.let { arr ->
            for (i in 0 until arr.length()) {
                val a = arr.getJSONObject(i)
                val slug = a.optString("slug")
                val assetsArr = a.optJSONArray("assets")
                val assetList = mutableListOf<String>()
                if (assetsArr != null) {
                    for (j in 0 until assetsArr.length()) {
                        val item = assetsArr.optString(j)
                        if (item.isNotEmpty()) assetList.add(item)
                    }
                }
                articlesBySlug[slug] = ArticleMeta(
                    id = a.optString("id"),
                    order = a.optInt("order", i + 1),
                    title = a.optString("title"),
                    brand = a.optString("brand"),
                    year = a.optInt("year", 2026),
                    slug = slug,
                    route = a.optString("route"),
                    publishedAt = a.optString("publishedAt"),
                    kind = a.optString("kind", "gallery"),
                    hasDigest = a.optBoolean("hasDigest", true),
                    cover = a.optString("cover"),
                    estimatedBytes = a.optLong("estimatedBytes", 512 * 1024L),
                    assets = assetList
                )
            }
        }
    }

    @Synchronized
    private fun loadStateSync() {
        articleStates.clear()
        if (stateFile.exists()) {
            try {
                val root = JSONObject(stateFile.readText())
                val arts = root.optJSONObject("articles")
                if (arts != null) {
                    val keys = arts.keys()
                    while (keys.hasNext()) {
                        val slug = keys.next()
                        val item = arts.getJSONObject(slug)
                        val status = item.optString("status", "none")
                        val bytes = item.optLong("downloadedBytes", 0L)
                        val updatedAt = item.optLong("updatedAt", 0L)
                        val meta = articlesBySlug[slug]
                        if (status == "ready" && meta != null && isArticleHtmlOnDisk(meta)) {
                            articleStates[slug] = ArticleOfflineState(
                                status = "ready",
                                progress = 100,
                                downloadedBytes = bytes.coerceAtLeast(meta.estimatedBytes / 2),
                                updatedAt = updatedAt
                            )
                        }
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun isArticleHtmlOnDisk(meta: ArticleMeta): Boolean {
        val pageHash = hashNormalizedUrl("$BASE_URL/${meta.route}")
        val f = File(offlinePackDir, pageHash)
        return f.exists() && f.length() > 0
    }

    @Synchronized
    private fun persistStateSync() {
        try {
            val root = JSONObject()
            val arts = JSONObject()
            for ((slug, st) in articleStates) {
                if (st.status == "ready") {
                    val obj = JSONObject()
                    obj.put("status", st.status)
                    obj.put("downloadedBytes", st.downloadedBytes)
                    obj.put("updatedAt", st.updatedAt)
                    arts.put(slug, obj)
                }
            }
            root.put("articles", arts)
            stateFile.writeText(root.toString())
        } catch (_: Exception) {}
    }

    fun getLocalCachedFile(rawUrl: String): File? {
        val hash = hashNormalizedUrl(rawUrl)

        val offlineFile = File(offlinePackDir, hash)
        if (offlineFile.exists() && offlineFile.length() > 0) {
            return offlineFile
        }

        val cacheFile = File(webCacheDir, hash)
        if (cacheFile.exists() && cacheFile.length() > 0) {
            cacheFile.setLastModified(System.currentTimeMillis())
            return cacheFile
        }

        return null
    }

    suspend fun saveToTempCache(rawUrl: String, data: ByteArray) = withContext(Dispatchers.IO) {
        try {
            val hash = hashNormalizedUrl(rawUrl)
            val offlineFile = File(offlinePackDir, hash)
            if (offlineFile.exists() && offlineFile.length() > 0) return@withContext

            val cacheFile = File(webCacheDir, hash)
            FileOutputStream(cacheFile).use { it.write(data) }
            enforceLruQuota()

            // 智能离线：检测是否为文章主页面
            checkAndAutoOfflineArticle(rawUrl)
        } catch (_: Exception) {}
    }

    /**
     * 自动离线：当用户浏览阅读任意文章时，自动将该文章的所有配图加入后台静默缓存，离线保存
     */
    private fun checkAndAutoOfflineArticle(rawUrl: String) {
        val normalized = normalizeUrl(rawUrl)
        if (!normalized.endsWith("/")) return
        val sub = normalized.removePrefix(BASE_URL).removePrefix("/").removeSuffix("/")
        val segments = sub.split("/")
        if (segments.size >= 3 && segments[1].matches(Regex("202\\d"))) {
            val slug = segments[2]
            val meta = articlesBySlug[slug] ?: return
            if (articleStates[slug]?.status != "ready" && articleStates[slug]?.status != "downloading") {
                scope.launch {
                    val pageHash = hashNormalizedUrl(normalized)
                    val tempHtml = File(webCacheDir, pageHash)
                    val targetHtml = File(offlinePackDir, pageHash)
                    if (tempHtml.exists() && tempHtml.length() > 0 && !targetHtml.exists()) {
                        tempHtml.copyTo(targetHtml, overwrite = true)
                    }
                    downloadSingleArticleInternal(meta) {}
                }
            }
        }
    }

    private fun enforceLruQuota() {
        val files = webCacheDir.listFiles()?.filter { it.isFile } ?: return
        var currentTotal = files.sumOf { it.length() }

        if (currentTotal > MAX_CACHE_BYTES) {
            val sorted = files.sortedBy { it.lastModified() }
            for (file in sorted) {
                val len = file.length()
                if (file.delete()) {
                    currentTotal -= len
                    if (currentTotal <= MAX_CACHE_BYTES * 0.85) break
                }
            }
        }
    }

    private fun ensureCoreAssetsCached() {
        for (rel in coreAssets) {
            val url = if (rel.isEmpty()) "$BASE_URL/" else "$BASE_URL/$rel"
            downloadResourceToFile(url, offlinePackDir)
        }
    }

    private fun downloadResourceToFile(rawUrl: String, targetDir: File): Long {
        val normalized = normalizeUrl(rawUrl)
        val hash = hashNormalizedUrl(normalized)
        val targetFile = File(targetDir, hash)
        if (targetFile.exists() && targetFile.length() > 0) {
            return targetFile.length()
        }

        val tempFile = File(webCacheDir, hash)
        if (tempFile.exists() && tempFile.length() > 0 && targetDir == offlinePackDir) {
            try {
                tempFile.copyTo(targetFile, overwrite = true)
                return targetFile.length()
            } catch (_: Exception) {}
        }

        return try {
            val request = Request.Builder().url(normalized).build()
            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val tmpDownload = File(targetDir, "$hash.tmp")
                    response.body?.byteStream()?.use { input ->
                        FileOutputStream(tmpDownload).use { output ->
                            input.copyTo(output)
                        }
                    }
                    if (tmpDownload.exists() && tmpDownload.length() > 0) {
                        tmpDownload.renameTo(targetFile)
                        targetFile.length()
                    } else {
                        tmpDownload.delete()
                        0L
                    }
                } else {
                    0L
                }
            }
        } catch (_: Exception) {
            0L
        }
    }

    /**
     * 单篇文章全资源并行加速下载
     */
    private suspend fun downloadSingleArticleInternal(
        meta: ArticleMeta,
        onStepProgress: (Int) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        val totalAssets = meta.assets.size + 1
        val completedCount = AtomicInteger(0)
        val totalBytes = AtomicLong(0L)

        articleStates[meta.slug] = ArticleOfflineState(
            status = "downloading",
            progress = 3,
            downloadedBytes = 0L,
            updatedAt = System.currentTimeMillis()
        )
        notifyStateChanged()

        // 1. 下载主 HTML
        val pageUrl = "$BASE_URL/${meta.route}"
        val htmlBytes = downloadResourceToFile(pageUrl, offlinePackDir)
        if (htmlBytes <= 0L) {
            articleStates[meta.slug] = ArticleOfflineState(
                status = "error",
                progress = 0,
                downloadedBytes = 0L,
                updatedAt = System.currentTimeMillis()
            )
            notifyStateChanged()
            return@withContext false
        }
        totalBytes.addAndGet(htmlBytes)
        completedCount.incrementAndGet()

        // 2. 8 路并发下载关联所有资源文件
        val semaphore = Semaphore(8)
        val deferredList = meta.assets.map { relAsset ->
            async {
                semaphore.withPermit {
                    val assetUrl = if (relAsset.startsWith("http")) relAsset else "$BASE_URL/$relAsset"
                    val b = downloadResourceToFile(assetUrl, offlinePackDir)
                    if (b > 0L) {
                        totalBytes.addAndGet(b)
                    }
                    val c = completedCount.incrementAndGet()
                    val pct = ((c * 100) / totalAssets).coerceIn(5, 99)
                    if (c % 2 == 0 || c == totalAssets) {
                        articleStates[meta.slug] = ArticleOfflineState(
                            "downloading", pct, totalBytes.get(), System.currentTimeMillis()
                        )
                        onStepProgress(pct)
                        notifyStateChanged()
                    }
                }
            }
        }
        deferredList.awaitAll()

        articleStates[meta.slug] = ArticleOfflineState(
            status = "ready",
            progress = 100,
            downloadedBytes = totalBytes.get().coerceAtLeast(meta.estimatedBytes),
            updatedAt = System.currentTimeMillis()
        )
        persistStateSync()
        notifyStateChanged()
        true
    }

    /**
     * 触发单篇文章下载
     */
    fun startDownloadArticle(slug: String) {
        val meta = articlesBySlug[slug] ?: return
        if (activeJob?.isActive == true) {
            activeJob?.cancel()
        }
        activeJob = scope.launch {
            try {
                updateActiveTask(
                    TaskProgress(
                        taskId = "article:$slug",
                        label = "正在离线文章",
                        currentTitle = meta.title,
                        percent = 2,
                        completedCount = 0,
                        totalCount = 1,
                        isRunning = true
                    )
                )

                ensureCoreAssetsCached()

                downloadSingleArticleInternal(meta) { pct ->
                    activeTask = activeTask?.copy(percent = pct)
                    taskProgressListener?.invoke(activeTask)
                }

                updateActiveTask(
                    TaskProgress(
                        taskId = "article:$slug",
                        label = "离线完成",
                        currentTitle = meta.title,
                        percent = 100,
                        completedCount = 1,
                        totalCount = 1,
                        isRunning = false
                    )
                )
            } catch (_: CancellationException) {
                if (articleStates[slug]?.status == "downloading") {
                    articleStates.remove(slug)
                }
                updateActiveTask(null)
            }
        }
    }

    /**
     * 触发某个品牌的批量离线（4 篇文章并行处理）
     */
    fun startDownloadBrand(brandId: String) {
        val brandMeta = brandsById[brandId] ?: return
        val list = articlesBySlug.values.filter { it.brand == brandId }.sortedBy { it.order }
        if (list.isEmpty()) return

        if (activeJob?.isActive == true) {
            activeJob?.cancel()
        }
        activeJob = scope.launch {
            try {
                val pending = list.filter { articleStates[it.slug]?.status != "ready" }
                val targets = if (pending.isEmpty()) list else pending
                val total = targets.size
                val finishedArticles = AtomicInteger(0)

                updateActiveTask(
                    TaskProgress(
                        taskId = "brand:$brandId",
                        label = "正在离线 ${brandMeta.title}",
                        currentTitle = "准备公共组件...",
                        percent = 2,
                        completedCount = 0,
                        totalCount = total,
                        isRunning = true
                    )
                )

                ensureCoreAssetsCached()

                val articleSemaphore = Semaphore(4)
                val jobs = targets.map { art ->
                    async {
                        articleSemaphore.withPermit {
                            activeTask = activeTask?.copy(currentTitle = art.title)
                            taskProgressListener?.invoke(activeTask)
                            downloadSingleArticleInternal(art) {}
                            val done = finishedArticles.incrementAndGet()
                            val overallPct = ((done * 100) / total).coerceIn(3, 99)
                            activeTask = activeTask?.copy(
                                completedCount = done,
                                percent = overallPct
                            )
                            taskProgressListener?.invoke(activeTask)
                            notifyStateChanged()
                        }
                    }
                }
                jobs.awaitAll()

                updateActiveTask(
                    TaskProgress(
                        taskId = "brand:$brandId",
                        label = "${brandMeta.title} 已全部离线",
                        currentTitle = "共 ${list.size} 篇档案就绪",
                        percent = 100,
                        completedCount = total,
                        totalCount = total,
                        isRunning = false
                    )
                )
            } catch (_: CancellationException) {
                for (art in list) {
                    if (articleStates[art.slug]?.status == "downloading") {
                        articleStates.remove(art.slug)
                    }
                }
                updateActiveTask(null)
            }
        }
    }

    /**
     * 触发全站所有品牌批量并行离线（4 篇大文章并发）
     */
    fun startDownloadAll() {
        val list = articlesBySlug.values.sortedBy { it.order }
        if (list.isEmpty()) return

        if (activeJob?.isActive == true) {
            activeJob?.cancel()
        }
        activeJob = scope.launch {
            try {
                val pending = list.filter { articleStates[it.slug]?.status != "ready" }
                val targets = if (pending.isEmpty()) list else pending
                val total = targets.size
                val finishedArticles = AtomicInteger(0)

                updateActiveTask(
                    TaskProgress(
                        taskId = "all",
                        label = "正在全站离线归档",
                        currentTitle = "同步全局导航与样式...",
                        percent = 1,
                        completedCount = 0,
                        totalCount = total,
                        isRunning = true
                    )
                )

                ensureCoreAssetsCached()

                val articleSemaphore = Semaphore(4)
                val jobs = targets.map { art ->
                    async {
                        articleSemaphore.withPermit {
                            activeTask = activeTask?.copy(currentTitle = art.title)
                            taskProgressListener?.invoke(activeTask)
                            downloadSingleArticleInternal(art) {}
                            val done = finishedArticles.incrementAndGet()
                            val overallPct = ((done * 100) / total).coerceIn(2, 99)
                            activeTask = activeTask?.copy(
                                completedCount = done,
                                percent = overallPct
                            )
                            taskProgressListener?.invoke(activeTask)
                            notifyStateChanged()
                        }
                    }
                }
                jobs.awaitAll()

                updateActiveTask(
                    TaskProgress(
                        taskId = "all",
                        label = "全站离线归档完成",
                        currentTitle = "全部 ${list.size} 篇档案已保存在本地",
                        percent = 100,
                        completedCount = total,
                        totalCount = total,
                        isRunning = false
                    )
                )
            } catch (_: CancellationException) {
                for (art in list) {
                    if (articleStates[art.slug]?.status == "downloading") {
                        articleStates.remove(art.slug)
                    }
                }
                updateActiveTask(null)
            }
        }
    }

    fun cancelActiveDownload() {
        activeJob?.cancel()
        activeJob = null
        updateActiveTask(null)
        for ((slug, st) in articleStates) {
            if (st.status == "downloading") {
                articleStates.remove(slug)
            }
        }
        notifyStateChanged()
    }

    fun removeArticleOffline(slug: String) {
        scope.launch {
            val meta = articlesBySlug[slug] ?: return@launch
            deleteArticleFilesInternal(meta)
            articleStates.remove(slug)
            persistStateSync()
            notifyStateChanged()
        }
    }

    fun removeBrandOffline(brandId: String) {
        scope.launch {
            val brandArticles = articlesBySlug.values.filter { it.brand == brandId }
            for (meta in brandArticles) {
                deleteArticleFilesInternal(meta)
                articleStates.remove(meta.slug)
            }
            persistStateSync()
            notifyStateChanged()
        }
    }

    fun clearAllCache(includeOfflinePacks: Boolean) {
        scope.launch {
            webCacheDir.listFiles()?.forEach { if (it.isFile) it.delete() }
            if (includeOfflinePacks) {
                offlinePackDir.listFiles()?.forEach { if (it.isFile) it.delete() }
                articleStates.clear()
                persistStateSync()
            }
            updateActiveTask(null)
        }
    }

    private fun deleteArticleFilesInternal(meta: ArticleMeta) {
        val otherReadyAssets = mutableSetOf<String>()
        for ((otherSlug, st) in articleStates) {
            if (otherSlug != meta.slug && st.status == "ready") {
                articlesBySlug[otherSlug]?.assets?.let { otherReadyAssets.addAll(it) }
            }
        }

        val pageHash = hashNormalizedUrl("$BASE_URL/${meta.route}")
        File(offlinePackDir, pageHash).delete()

        for (rel in meta.assets) {
            if (!otherReadyAssets.contains(rel) && !coreAssets.contains(rel)) {
                val h = hashNormalizedUrl("$BASE_URL/$rel")
                File(offlinePackDir, h).delete()
            }
        }
    }

    fun buildFullStateJsonString(): String {
        val root = JSONObject()

        val tempBytes = webCacheDir.listFiles()?.filter { it.isFile }?.sumOf { it.length() } ?: 0L
        val offlineBytes = offlinePackDir.listFiles()?.filter { it.isFile }?.sumOf { it.length() } ?: 0L
        val totalBytes = tempBytes + offlineBytes

        val allArticles = articlesBySlug.values.sortedBy { it.order }
        val readyArticlesCount = allArticles.count { articleStates[it.slug]?.status == "ready" }

        val storageObj = JSONObject().apply {
            put("tempBytes", tempBytes)
            put("offlineBytes", offlineBytes)
            put("totalBytes", totalBytes)
            put("maxQuotaBytes", MAX_CACHE_BYTES)
            put("readyArticlesCount", readyArticlesCount)
            put("totalArticlesCount", allArticles.size)
        }
        root.put("storage", storageObj)

        val task = activeTask
        if (task != null) {
            root.put("activeTask", JSONObject().apply {
                put("taskId", task.taskId)
                put("label", task.label)
                put("currentTitle", task.currentTitle)
                put("percent", task.percent)
                put("completedCount", task.completedCount)
                put("totalCount", task.totalCount)
                put("isRunning", task.isRunning)
            })
        } else {
            root.put("activeTask", JSONObject.NULL)
        }

        val brandOrder = listOf("coloros", "originos", "hyperos", "magicos", "harmonyos")
        val brandsArr = JSONArray()
        for (bId in brandOrder) {
            val bMeta = brandsById[bId] ?: continue
            val bArticles = allArticles.filter { it.brand == bId }
            val readyCount = bArticles.count { articleStates[it.slug]?.status == "ready" }
            val downloadingCount = bArticles.count { articleStates[it.slug]?.status == "downloading" }
            val downloadedBytes = bArticles.sumOf {
                val st = articleStates[it.slug]
                if (st?.status == "ready" || st?.status == "downloading") st.downloadedBytes else 0L
            }

            brandsArr.put(JSONObject().apply {
                put("id", bMeta.id)
                put("title", bMeta.title)
                put("subtitle", bMeta.subtitle)
                put("route", bMeta.route)
                put("accent", bMeta.accent)
                put("soft", bMeta.soft)
                put("logo", bMeta.logo)
                put("articleCount", bArticles.size)
                put("readyCount", readyCount)
                put("downloadingCount", downloadingCount)
                put("estimatedBytes", bMeta.estimatedBytes)
                put("downloadedBytes", downloadedBytes)
            })
        }
        root.put("brands", brandsArr)

        val articlesArr = JSONArray()
        for (art in allArticles) {
            val st = articleStates[art.slug]
            articlesArr.put(JSONObject().apply {
                put("id", art.id)
                put("order", art.order)
                put("title", art.title)
                put("brand", art.brand)
                put("year", art.year)
                put("slug", art.slug)
                put("route", art.route)
                put("publishedAt", art.publishedAt)
                put("kind", art.kind)
                put("hasDigest", art.hasDigest)
                put("estimatedBytes", art.estimatedBytes)
                put("assetCount", art.assets.size + 1)
                put("status", st?.status ?: "none")
                put("progress", st?.progress ?: 0)
                put("downloadedBytes", st?.downloadedBytes ?: 0L)
            })
        }
        root.put("articles", articlesArr)

        return root.toString()
    }
}
