package com.osarchive.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

class OfflineDownloadService : Service() {

    companion object {
        const val CHANNEL_ID = "offline_download_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START_ALL = "com.osarchive.app.action.DOWNLOAD_ALL"
        const val ACTION_START_BRAND = "com.osarchive.app.action.DOWNLOAD_BRAND"
        const val ACTION_START_ARTICLE = "com.osarchive.app.action.DOWNLOAD_ARTICLE"
        const val ACTION_CANCEL = "com.osarchive.app.action.CANCEL"

        const val EXTRA_BRAND_ID = "extra_brand_id"
        const val EXTRA_SLUG = "extra_slug"

        fun startDownloadAll(context: Context) {
            val intent = Intent(context, OfflineDownloadService::class.java).apply {
                action = ACTION_START_ALL
            }
            startServiceCompat(context, intent)
        }

        fun startDownloadBrand(context: Context, brandId: String) {
            val intent = Intent(context, OfflineDownloadService::class.java).apply {
                action = ACTION_START_BRAND
                putExtra(EXTRA_BRAND_ID, brandId)
            }
            startServiceCompat(context, intent)
        }

        fun startDownloadArticle(context: Context, slug: String) {
            val intent = Intent(context, OfflineDownloadService::class.java).apply {
                action = ACTION_START_ARTICLE
                putExtra(EXTRA_SLUG, slug)
            }
            startServiceCompat(context, intent)
        }

        fun cancelDownload(context: Context) {
            val intent = Intent(context, OfflineDownloadService::class.java).apply {
                action = ACTION_CANCEL
            }
            startServiceCompat(context, intent)
        }

        private fun startServiceCompat(context: Context, intent: Intent) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var cacheManager: StorageCacheManager

    override fun onCreate() {
        super.onCreate()
        cacheManager = StorageCacheManager.getInstance(this)
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("准备离线归档...", 0, false))

        // 监听下载进度更新通知栏
        cacheManager.setOnTaskProgressListener { task ->
            if (task == null || !task.isRunning) {
                val doneTitle = task?.label ?: "离线归档完成"
                updateNotification(doneTitle, 100, false)
                stopForeground(false)
                stopSelf()
            } else {
                updateNotification("${task.label}: ${task.currentTitle}", task.percent, true)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_ALL -> {
                cacheManager.startDownloadAll()
            }
            ACTION_START_BRAND -> {
                val brandId = intent.getStringExtra(EXTRA_BRAND_ID)
                if (!brandId.isNullOrBlank()) {
                    cacheManager.startDownloadBrand(brandId)
                }
            }
            ACTION_START_ARTICLE -> {
                val slug = intent.getStringExtra(EXTRA_SLUG)
                if (!slug.isNullOrBlank()) {
                    cacheManager.startDownloadArticle(slug)
                }
            }
            ACTION_CANCEL -> {
                cacheManager.cancelActiveDownload()
                stopForeground(true)
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "离线归档下载服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "后台下载全站档案图文、样式与数据"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(text: String, progress: Int, isIndeterminate: Boolean): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val cancelIntent = Intent(this, OfflineDownloadService::class.java).apply {
            action = ACTION_CANCEL
        }
        val cancelPendingIntent = PendingIntent.getService(
            this,
            1,
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("OS档案馆 · 正在离线保存")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_archive)
            .setContentIntent(pendingIntent)
            .setProgress(100, progress, isIndeterminate)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addAction(R.drawable.ic_close, "取消下载", cancelPendingIntent)
            .build()
    }

    private fun updateNotification(text: String, progress: Int, isRunning: Boolean) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, buildNotification(text, progress, !isRunning && progress == 0))
    }
}
