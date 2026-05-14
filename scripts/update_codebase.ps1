$root = Get-Item .
$outputFile = Join-Path $root.FullName "FocusFlow_Codebase.txt"
$excludeRegex = "\\\.git|node_modules|package-lock\.json|FocusFlow_Codebase\.txt|dist|dist_FINAL|build|\.env|\.gitignore|\.map$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.svg$|\.pdf$|\.zip$|\.tar$|\.gz$|\.exe$|\.dll$|\.bin$|vite\.config\.js\.timestamp-"

Write-Host "Updating codebase in $outputFile..."

"" | Out-File -FilePath $outputFile -Encoding utf8

$files = Get-ChildItem -Path $root.FullName -Recurse -File | Where-Object {
    $_.FullName -notmatch $excludeRegex
}

foreach ($file in $files) {
    $relativePath = Resolve-Path $file.FullName -Relative

    $relativePath = $relativePath.Substring(2)

    Write-Host "Processing $relativePath..."

    "`n`n==================================================" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "FILE: $relativePath" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "==================================================`n" | Out-File -FilePath $outputFile -Append -Encoding utf8

    Get-Content $file.FullName | Out-File -FilePath $outputFile -Append -Encoding utf8
}

Write-Host "Done!"
