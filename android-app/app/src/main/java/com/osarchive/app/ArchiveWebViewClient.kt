package com.osarchive.app

import android.content.Context
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.BufferedInputStream
import java.io.ByteArrayInputStream
import java.io.FileInputStream
import java.util.concurrent.TimeUnit

class ArchiveWebViewClient(
    private val context: Context,
    private val cacheManager: StorageCacheManager,
    private val onOfflineStateChanged: (isOffline: Boolean) -> Unit
) : WebViewClient() {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(18, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    private val injectedScript: String by lazy {
        try {
            context.assets.open("app-offline-ui.js").bufferedReader().use { it.readText() }
        } catch (_: Exception) {
            ""
        }
    }

    private fun isOnline(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val activeNet = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(activeNet) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun inferMimeType(rawUrl: String): String {
        val normalized = StorageCacheManager.normalizeUrl(rawUrl).lowercase()
        return when {
            normalized.endsWith(".html") || normalized.endsWith("/") -> "text/html"
            normalized.endsWith(".css") -> "text/css"
            normalized.endsWith(".js") || normalized.endsWith(".mjs") -> "application/javascript"
            normalized.endsWith(".json") -> "application/json"
            normalized.endsWith(".webp") -> "image/webp"
            normalized.endsWith(".avif") -> "image/avif"
            normalized.endsWith(".png") -> "image/png"
            normalized.endsWith(".jpg") || normalized.endsWith(".jpeg") -> "image/jpeg"
            normalized.endsWith(".svg") -> "image/svg+xml"
            normalized.endsWith(".woff2") -> "font/woff2"
            normalized.endsWith(".mp4") -> "video/mp4"
            else -> "text/html"
        }
    }

    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
    ): WebResourceResponse? {
        val rawUrl = request?.url?.toString() ?: return null
        if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) return null

        val normalizedUrl = StorageCacheManager.normalizeUrl(rawUrl)

        // 屏蔽分析/遥测脚本，避免无意义的阻塞与网络连接泄漏
        if (normalizedUrl.contains("cloudflareinsights.com")) {
            return WebResourceResponse(
                "application/javascript",
                "UTF-8",
                ByteArrayInputStream(ByteArray(0))
            )
        }

        // 1. 优先命中本地离线归档包或历史磁盘缓存（零网络等待，32KB 缓冲流加速）
        val localFile = cacheManager.getLocalCachedFile(normalizedUrl)
        if (localFile != null && localFile.exists() && localFile.length() > 0) {
            try {
                val mime = inferMimeType(normalizedUrl)
                val encoding = if (mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json")) "UTF-8" else null
                val response = WebResourceResponse(mime, encoding, BufferedInputStream(FileInputStream(localFile), 32768))
                response.responseHeaders = mapOf(
                    "Access-Control-Allow-Origin" to "*",
                    "Cache-Control" to "public, max-age=31536000, immutable",
                    "X-Archive-Source" to "Local-Disk-Cache"
                )
                return response
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 2. 本地未命中且处于断网状态
        if (!isOnline()) {
            coroutineScope.launch(Dispatchers.Main) {
                onOfflineStateChanged(true)
            }
            if (inferMimeType(normalizedUrl) == "text/html" && request.isForMainFrame) {
                val offlineHtml = """
                    <!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
                      <title>该页面尚未离线 · OS档案馆</title>
                      <style>
                        body {
                          margin: 0;
                          min-height: 100vh;
                          display: grid;
                          place-items: center;
                          padding: 24px;
                          background: #f6f8fc;
                          color: #18191c;
                          font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
                        }
                        .card {
                          max-width: 380px;
                          width: 100%;
                          background: rgba(255,255,255,0.88);
                          border: 1px solid rgba(255,255,255,0.95);
                          border-radius: 22px;
                          padding: 24px;
                          text-align: center;
                          box-shadow: 0 12px 32px rgba(15,23,42,0.06);
                        }
                        h2 { margin: 0 0 8px; font-size: 18px; }
                        p { margin: 0 0 18px; font-size: 13.5px; color: #5b6068; line-height: 1.6; }
                        a {
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 40px;
                          padding: 0 18px;
                          border-radius: 999px;
                          background: #18191c;
                          color: #fff;
                          text-decoration: none;
                          font-size: 13px;
                          font-weight: 600;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="card">
                        <h2>当前处于离线状态</h2>
                        <p>该篇档案尚未保存到本地离线包。你可以返回已离线的首页或品牌目录查看已缓存的文章。</p>
                        <a href="https://ricky2036.github.io/os_updates_archive/">返回档案馆首页</a>
                      </div>
                    </body>
                    </html>
                """.trimIndent()
                return WebResourceResponse(
                    "text/html",
                    "UTF-8",
                    ByteArrayInputStream(offlineHtml.toByteArray(Charsets.UTF_8))
                )
            }
            return null
        }

        // 3. 在线按需加载并自动写入本地磁盘缓存（下次进入不再重新下载）
        return try {
            val req = Request.Builder().url(normalizedUrl).build()
            httpClient.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val bytes = resp.body?.bytes()
                    if (bytes != null && bytes.isNotEmpty()) {
                        coroutineScope.launch {
                            cacheManager.saveToTempCache(normalizedUrl, bytes)
                        }

                        val rawMime = resp.header("content-type")?.substringBefore(";")?.trim()
                        val mime = if (!rawMime.isNullOrEmpty()) rawMime else inferMimeType(normalizedUrl)
                        val encoding = if (mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json")) "UTF-8" else null
                        val webResponse = WebResourceResponse(
                            mime,
                            encoding,
                            ByteArrayInputStream(bytes)
                        )
                        webResponse.responseHeaders = mapOf(
                            "Access-Control-Allow-Origin" to "*",
                            "Cache-Control" to "public, max-age=604800",
                            "X-Archive-Source" to "Remote-Hydrated"
                        )
                        webResponse
                    } else null
                } else null
            }
        } catch (_: Exception) {
            null
        }
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        onOfflineStateChanged(!isOnline())
        // 早期注入：在 Chromium 绘制首帧前禁用 GPU 瓶颈光斑与加速页面转场
        view?.evaluateJavascript("""
            (function() {
                var s = document.getElementById('os-app-early-perf-css');
                if (!s) {
                    s = document.createElement('style');
                    s.id = 'os-app-early-perf-css';
                    s.textContent = '.ambient-layer, .ambient-blob { display: none !important; animation: none !important; filter: none !important; will-change: auto !important; } ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0.12s !important; }';
                    (document.head || document.documentElement).appendChild(s);
                }
            })();
        """.trimIndent(), null)
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        onOfflineStateChanged(!isOnline())
        if (injectedScript.isNotEmpty()) {
            view?.evaluateJavascript(injectedScript, null)
        }
    }
}
