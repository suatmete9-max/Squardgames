package com.squardgames.app

/** Debug builds use Google's TEST ad units (never click your own live ads - AdMob bans for that). Release builds use your real units. */
object AdIds {
    private val t = BuildConfig.DEBUG
    val BANNER_TOP = if (t) "ca-app-pub-3940256099942544/6300978111" else "ca-app-pub-7733707393878334/4678109938"
    val BANNER_BOTTOM = if (t) "ca-app-pub-3940256099942544/6300978111" else "ca-app-pub-7733707393878334/1458864315"
    val INTERSTITIAL_LEVEL = if (t) "ca-app-pub-3940256099942544/1033173712" else "ca-app-pub-7733707393878334/2569775165"
    val INTERSTITIAL_OVER = if (t) "ca-app-pub-3940256099942544/1033173712" else "ca-app-pub-7733707393878334/1431953319" // your "inst beta" unit - must be an Interstitial unit in AdMob
    val REWARDED = if (t) "ca-app-pub-3940256099942544/5224354917" else "ca-app-pub-7733707393878334/7585288963"
    val NATIVE = if (t) "ca-app-pub-3940256099942544/2247696110" else "ca-app-pub-7733707393878334/9681978429"
    val APP_OPEN = if (t) "ca-app-pub-3940256099942544/9257395921" else "ca-app-pub-7733707393878334/1611916717"
}
