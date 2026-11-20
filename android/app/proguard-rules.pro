-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault

-keep class com.getcapacitor.MessageHandler {
    @android.webkit.JavascriptInterface <methods>;
}

-keep @interface com.getcapacitor.annotation.**
-keep @interface com.getcapacitor.PluginMethod
-keep @interface com.getcapacitor.NativePlugin

-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

-dontwarn org.slf4j.**
-dontwarn javax.annotation.**
