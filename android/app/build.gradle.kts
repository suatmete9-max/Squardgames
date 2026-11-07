plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.squardgames.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.squardgames.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        // >>> CHANGE THIS to your live website address (must end with /) <<<
        buildConfigField("String", "SITE_URL", "\"https://YOUR-SITE.onrender.com/\"")
    }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { buildConfig = true }
}
dependencies {
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("com.google.android.gms:play-services-ads:25.5.0")
    implementation("com.google.android.ump:user-messaging-platform:3.2.0")
}
