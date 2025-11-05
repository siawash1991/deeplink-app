```mermaid
graph TD
    A[کاربر کلیک می‌کند روی لینک کوتاه] --> B[سرور Express/Node.js]
    B --> C{بررسی shortCode در دیتابیس}
    C -->|پیدا نشد| D[404 Error]
    C -->|پیدا شد| E[آپدیت Analytics]
    E --> F[تشخیص User-Agent]
    F --> G{نوع دستگاه؟}
    
    G -->|iOS| H[تولید صفحه HTML با iOS Deep Link]
    G -->|Android| I[تولید صفحه HTML با Android Deep Link]
    G -->|Desktop| J[Redirect مستقیم به وبسایت]
    
    H --> K[صفحه HTML واسط]
    I --> K
    
    K --> L[JavaScript تلاش می‌کند اپ را باز کند]
    L --> M{آیا اپ نصب است؟}
    
    M -->|بله| N[باز شدن اپلیکیشن موبایل]
    M -->|خیر| O[Fallback: Redirect به مرورگر]
    
    N --> P[ثبت آمار: appOpened = true]
    O --> Q[ثبت آمار: appOpened = false]
    
    P --> R[پایان]
    Q --> R
    J --> R
    
    style A fill:#667eea
    style N fill:#10b981
    style O fill:#f59e0b
    style D fill:#ef4444
```

## نمونه URL Schemes:

```javascript
// YouTube
youtube://watch/{video_id}
vnd.youtube://watch/{video_id}

// Instagram  
instagram://user?username={username}
instagram://media?id={post_id}

// Spotify
spotify://track/{track_id}

// TikTok
snssdk1233://video/{video_id}

// Twitter/X
twitter://user?screen_name={username}

// Amazon
amazon://www.amazon.com/dp/{product_id}
```

## مثال واقعی Deep Linking:

### قبل (لینک عادی):
```
https://youtube.com/watch?v=dQw4w9WgXcQ
```
👎 وقتی در اینستاگرام کلیک می‌شود → باز می‌شود در مرورگر درون‌اپلیکیشن → کاربر لاگین نیست → تجربه بد

### بعد (با Deep Link):
```
https://yourdomain.com/abc123
```
👍 وقتی کلیک می‌شود → مستقیماً اپ یوتوب باز می‌شود → کاربر لاگین است → تجربه عالی → نرخ subscribe بالاتر
