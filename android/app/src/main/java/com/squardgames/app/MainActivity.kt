package com.squardgames.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.nativead.MediaView
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform

class MainActivity : AppCompatActivity() {
    private lateinit var web: WebView
    private lateinit var topAd: AdView
    private lateinit var bottomAd: AdView
    private lateinit var nativeBox: FrameLayout
    private var inter1: InterstitialAd? = null
    private var inter2: InterstitialAd? = null
    private var rewarded: RewardedAd? = null
    private var appOpen: AppOpenAd? = null
    private var appOpenAt = 0L
    private var nativeAd: NativeAd? = null
    private var nativeWanted = false
    private var showingFull = false
    private var launchShown = false
    private var started = false
    private var adsInit = false
    private var bgAt = 0L
    private var lastFull = 0L
    private var deadline = 0L
    private val ui = Handler(Looper.getMainLooper())

    private fun dp(v: Int) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics).toInt()
    private fun req() = AdRequest.Builder().build()
    private fun now() = SystemClock.elapsedRealtime()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.parseColor("#07031A")) }
        topAd = AdView(this).apply { setAdSize(AdSize.BANNER); adUnitId = AdIds.BANNER_TOP }
        bottomAd = AdView(this).apply { setAdSize(AdSize.BANNER); adUnitId = AdIds.BANNER_BOTTOM }
        nativeBox = FrameLayout(this).apply { visibility = View.GONE }
        web = WebView(this)
        root.addView(topAd, LinearLayout.LayoutParams(-2, -2).apply { gravity = Gravity.CENTER_HORIZONTAL })
        root.addView(web, LinearLayout.LayoutParams(-1, 0, 1f))
        root.addView(nativeBox, LinearLayout.LayoutParams(-1, -2))
        root.addView(bottomAd, LinearLayout.LayoutParams(-2, -2).apply { gravity = Gravity.CENTER_HORIZONTAL })
        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val s = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout() or WindowInsetsCompat.Type.ime())
            v.setPadding(s.left, s.top, s.right, s.bottom)
            WindowInsetsCompat.CONSUMED
        }
        WindowCompat.getInsetsController(window, root).isAppearanceLightStatusBars = false

        with(web.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = userAgentString + " SquardGamesApp/1.0"
        }
        web.setBackgroundColor(Color.parseColor("#07031A"))
        web.addJavascriptInterface(Bridge(), "SQApp")
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.host == Uri.parse(BuildConfig.SITE_URL).host) return false
                try { startActivity(Intent(Intent.ACTION_VIEW, u)) } catch (_: Exception) {}
                return true
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) view.loadDataWithBaseURL(null, errorHtml(), "text/html", "utf-8", null)
            }
        }
        web.loadUrl(BuildConfig.SITE_URL)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { if (web.canGoBack()) web.goBack() else finish() }
        })

        // Consent (needed for EEA/UK users), then start ads
        deadline = now() + 5000
        val ci = UserMessagingPlatform.getConsentInformation(this)
        ci.requestConsentInfoUpdate(this, ConsentRequestParameters.Builder().build(), {
            UserMessagingPlatform.loadAndShowConsentFormIfRequired(this) { _ -> if (ci.canRequestAds()) initAds() }
        }, { _ -> if (ci.canRequestAds()) initAds() })
        if (ci.canRequestAds()) initAds()
    }

    private fun errorHtml() = "<body style='background:#07031a;color:#fff;font-family:sans-serif;text-align:center;padding-top:30vh'>" +
        "<h2>No internet connection</h2><button style='font-size:18px;padding:10px 24px' onclick=\"location.href='" + BuildConfig.SITE_URL + "'\">Retry</button></body>"

    private fun initAds() {
        if (adsInit) return
        adsInit = true
        MobileAds.initialize(this) {}
        topAd.loadAd(req()); bottomAd.loadAd(req())
        loadAppOpen(); loadInter1(); loadInter2(); loadRewarded()
        if (nativeWanted) loadNative()
    }

    // ---------- App Open ----------
    private fun loadAppOpen() {
        AppOpenAd.load(this, AdIds.APP_OPEN, req(), object : AppOpenAd.AppOpenAdLoadCallback() {
            override fun onAdLoaded(ad: AppOpenAd) {
                appOpen = ad; appOpenAt = now()
                if (!launchShown && now() < deadline) { launchShown = true; showAppOpen() }
            }
            override fun onAdFailedToLoad(e: LoadAdError) { appOpen = null }
        })
    }
    private fun showAppOpen() {
        val ad = appOpen ?: return
        if (showingFull) return
        if (now() - appOpenAt > 3 * 3600_000L) { appOpen = null; loadAppOpen(); return }
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() { showingFull = false; lastFull = now(); appOpen = null; loadAppOpen() }
            override fun onAdFailedToShowFullScreenContent(e: AdError) { showingFull = false; appOpen = null; loadAppOpen() }
        }
        showingFull = true
        ad.show(this)
    }

    // ---------- Interstitials ----------
    private fun loadInter1() {
        InterstitialAd.load(this, AdIds.INTERSTITIAL_LEVEL, req(), object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) { inter1 = ad }
            override fun onAdFailedToLoad(e: LoadAdError) { inter1 = null; ui.postDelayed({ loadInter1() }, 60000) }
        })
    }
    private fun loadInter2() {
        InterstitialAd.load(this, AdIds.INTERSTITIAL_OVER, req(), object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) { inter2 = ad }
            override fun onAdFailedToLoad(e: LoadAdError) { inter2 = null; ui.postDelayed({ loadInter2() }, 60000) }
        })
    }
    /** kind 1 = level complete, kind 2 = game over */
    private fun showInterstitial(id: Int, kind: Int) {
        val ad = if (kind == 2) (inter2 ?: inter1) else (inter1 ?: inter2)
        if (ad == null || showingFull) { done(id, false); return }
        val was1 = ad === inter1
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                showingFull = false; lastFull = now()
                if (was1) { inter1 = null; loadInter1() } else { inter2 = null; loadInter2() }
                done(id, true)
            }
            override fun onAdFailedToShowFullScreenContent(e: AdError) {
                showingFull = false
                if (was1) { inter1 = null; loadInter1() } else { inter2 = null; loadInter2() }
                done(id, false)
            }
        }
        showingFull = true
        ad.show(this)
    }

    // ---------- Rewarded ----------
    private fun loadRewarded() {
        RewardedAd.load(this, AdIds.REWARDED, req(), object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) { rewarded = ad }
            override fun onAdFailedToLoad(e: LoadAdError) { rewarded = null; ui.postDelayed({ loadRewarded() }, 60000) }
        })
    }
    private fun showRewarded(id: Int) {
        val ad = rewarded
        if (ad == null || showingFull) { done(id, false); return }
        var earned = false
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() { showingFull = false; lastFull = now(); rewarded = null; loadRewarded(); done(id, earned) }
            override fun onAdFailedToShowFullScreenContent(e: AdError) { showingFull = false; rewarded = null; loadRewarded(); done(id, false) }
        }
        showingFull = true
        ad.show(this) { earned = true }
    }

    // ---------- Native (shown only on the home / game-selection page) ----------
    private fun loadNative() {
        AdLoader.Builder(this, AdIds.NATIVE).forNativeAd { ad ->
            nativeAd?.destroy(); nativeAd = ad; renderNative(ad)
            nativeBox.visibility = if (nativeWanted) View.VISIBLE else View.GONE
        }.withAdListener(object : AdListener() {
            override fun onAdFailedToLoad(e: LoadAdError) { nativeBox.visibility = View.GONE }
        }).build().loadAd(req())
    }
    private fun renderNative(ad: NativeAd) {
        val v = NativeAdView(this)
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(dp(8), dp(8), dp(8), dp(8)); setBackgroundColor(Color.parseColor("#1A0F40")) }
        val media = MediaView(this)
        row.addView(media, LinearLayout.LayoutParams(dp(120), dp(120)))
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(10), 0, 0, 0) }
        val tag = TextView(this).apply { text = "Ad"; textSize = 10f; setTextColor(Color.BLACK); setBackgroundColor(Color.parseColor("#FFE14D")); setPadding(dp(4), 0, dp(4), 0) }
        val head = TextView(this).apply { textSize = 16f; setTextColor(Color.WHITE); maxLines = 2; text = ad.headline }
        val body = TextView(this).apply { textSize = 12f; setTextColor(Color.LTGRAY); maxLines = 3; text = ad.body }
        val cta = Button(this).apply { text = ad.callToAction; visibility = if (ad.callToAction == null) View.GONE else View.VISIBLE }
        col.addView(tag); col.addView(head); col.addView(body); col.addView(cta)
        row.addView(col, LinearLayout.LayoutParams(0, -2, 1f))
        v.addView(row)
        v.mediaView = media; v.headlineView = head; v.bodyView = body; v.callToActionView = cta
        media.mediaContent = ad.mediaContent
        v.setNativeAd(ad)
        nativeBox.removeAllViews(); nativeBox.addView(v)
    }
    private fun setNative(show: Boolean) {
        nativeWanted = show
        if (!show) { nativeBox.visibility = View.GONE; return }
        if (nativeAd != null) nativeBox.visibility = View.VISIBLE
        if (adsInit) loadNative()
    }

    private fun done(id: Int, ok: Boolean) { web.evaluateJavascript("window.SQN&&SQN.done($id,$ok)", null) }

    /** Called from the website (window.SQApp.*) */
    inner class Bridge {
        @JavascriptInterface fun interstitial(id: Int, kind: Int) { runOnUiThread { showInterstitial(id, kind) } }
        @JavascriptInterface fun rewarded(id: Int) { runOnUiThread { showRewarded(id) } }
        @JavascriptInterface fun nativeAd(show: Boolean) { runOnUiThread { setNative(show) } }
    }

    override fun onStart() {
        super.onStart()
        if (started && bgAt > 0 && now() - bgAt > 30000 && !showingFull && now() - lastFull > 5000) showAppOpen()
        started = true
    }
    override fun onStop() { super.onStop(); bgAt = now() }
    override fun onPause() { web.onPause(); topAd.pause(); bottomAd.pause(); super.onPause() }
    override fun onResume() { super.onResume(); web.onResume(); topAd.resume(); bottomAd.resume() }
    override fun onDestroy() { topAd.destroy(); bottomAd.destroy(); nativeAd?.destroy(); web.destroy(); super.onDestroy() }
}
