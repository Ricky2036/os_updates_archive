package com.osarchive.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.osarchive.app.databinding.ActivityMainBinding
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var cacheManager: StorageCacheManager

    companion object {
        const val HOME_URL = "https://ricky2036.github.io/os_updates_archive/"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        cacheManager = StorageCacheManager.getInstance(this)
        cacheManager.setOnStateChangeListener { stateJson ->
            runOnUiThread {
                pushStateToWeb(stateJson)
            }
        }

        initWebView()
        initBackNavigation()

        binding.webView.loadUrl(HOME_URL)
    }

    private fun pushStateToWeb(stateJson: String) {
        val escaped = JSONObject.quote(stateJson)
        val js = "window.__onOSArchiveStateUpdated && window.__onOSArchiveStateUpdated($escaped);"
        binding.webView.evaluateJavascript(js, null)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initWebView() {
        binding.webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        binding.webView.overScrollMode = View.OVER_SCROLL_NEVER
        binding.webView.isVerticalScrollBarEnabled = false
        binding.webView.isHorizontalScrollBarEnabled = false

        val settings = binding.webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.setSupportZoom(false)
        settings.textZoom = 100
        settings.mediaPlaybackRequiresUserGesture = false
        settings.offscreenPreRaster = true

        binding.webView.addJavascriptInterface(ArchiveJsBridge(), "OSArchiveApp")
        binding.webView.webChromeClient = WebChromeClient()

        binding.webView.webViewClient = ArchiveWebViewClient(
            context = this,
            cacheManager = cacheManager,
            onOfflineStateChanged = { isOffline ->
                runOnUiThread {
                    binding.tvOfflineBanner.visibility = if (isOffline) View.VISIBLE else View.GONE
                }
            }
        )
    }

    inner class ArchiveJsBridge {

        @JavascriptInterface
        fun getStateJson(): String {
            return cacheManager.buildFullStateJsonString()
        }

        @JavascriptInterface
        fun downloadArticle(slug: String) {
            if (slug.isNotBlank()) {
                OfflineDownloadService.startDownloadArticle(this@MainActivity, slug.trim())
            }
        }

        @JavascriptInterface
        fun removeArticle(slug: String) {
            if (slug.isNotBlank()) {
                cacheManager.removeArticleOffline(slug.trim())
            }
        }

        @JavascriptInterface
        fun downloadBrand(brandId: String) {
            if (brandId.isNotBlank()) {
                OfflineDownloadService.startDownloadBrand(this@MainActivity, brandId.trim())
            }
        }

        @JavascriptInterface
        fun removeBrand(brandId: String) {
            if (brandId.isNotBlank()) {
                cacheManager.removeBrandOffline(brandId.trim())
            }
        }

        @JavascriptInterface
        fun downloadAll() {
            OfflineDownloadService.startDownloadAll(this@MainActivity)
        }

        @JavascriptInterface
        fun cancelDownload() {
            OfflineDownloadService.cancelDownload(this@MainActivity)
        }

        @JavascriptInterface
        fun clearAllCache(includeOfflinePacks: Boolean) {
            cacheManager.clearAllCache(includeOfflinePacks)
        }
    }

    private fun initBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                binding.webView.evaluateJavascript(
                    "(function(){ return window.__closeOSArchiveDrawerIfOpen ? window.__closeOSArchiveDrawerIfOpen() : false; })()"
                ) { result ->
                    if (result == "true") {
                        return@evaluateJavascript
                    }
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })
    }
}
