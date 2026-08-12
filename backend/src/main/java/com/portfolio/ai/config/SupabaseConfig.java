package com.portfolio.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {
    private String url;
    private String anonKey;
    private String serviceKey;

    public String getUrl() {
        return url != null ? url : System.getenv("SUPABASE_URL");
    }

    public String getAnonKey() {
        return anonKey != null ? anonKey : System.getenv("SUPABASE_ANON_KEY");
    }

    public String getServiceKey() {
        return serviceKey != null ? serviceKey : System.getenv("SUPABASE_SERVICE_KEY");
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setAnonKey(String anonKey) {
        this.anonKey = anonKey;
    }

    public void setServiceKey(String serviceKey) {
        this.serviceKey = serviceKey;
    }
}
