# PowerShell script to add contact-form.js to all HTML files with newsletter forms

$files = @(
    "index.html",
    "contact-us/index.html",
    "portfolio/mockup-3d/index.html",
    "portfolio/jik/index.html",
    "portfolio/tyt/index.html",
    "portfolio/natura-branding/index.html",
    "portfolio/tricity-branding/index.html",
    "portfolio/rt/index.html",
    "portfolio/modern-3d-layout-for-dribble-presentation/index.html",
    "portfolio/modern-3d-layout-for-dribbble-presentation/index.html",
    "portfolio/jkj/index.html",
    "portfolio/mockup-3d-product-visualization/index.html",
    "portfolio/mnm/index.html",
    "portfolio/holographic-earpod-with-casing-design/index.html",
    "portfolio/dddd/index.html",
    "portfolio/ab/index.html"
)

$scriptTag = '	<!-- GeekPie Contact Form Handler -->' + "`r`n" + '	<script src="/js/contact-form.js"></script>'

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check if script is already added
        if ($content -match "contact-form\.js") {
            Write-Host "Script already exists in: $file" -ForegroundColor Yellow
            continue
        }
        
        # Add script before </body>
        if ($content -match "</body>") {
            $newContent = $content -replace "</body>", "$scriptTag`r`n</body>"
            Set-Content $file $newContent -NoNewline
            Write-Host "Updated: $file" -ForegroundColor Green
        } else {
            Write-Host "No </body> tag found in: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
