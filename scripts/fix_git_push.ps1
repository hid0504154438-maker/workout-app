Write-Host "Starting Git Fix Process..." -ForegroundColor Green

# 1. Remove existing .git folder to clear history
if (Test-Path .git) {
    Write-Host "Removing old .git folder..."
    Remove-Item -Recurse -Force .git
}

# 2. Ensure .gitignore is correct
Write-Host "Updating .gitignore..."
$ignoreContent = @"
node_modules/
.next/
.env.local
.env
service_account.json
vercel_key.txt
debug_output.json
debug_porat.json
"@
Set-Content .gitignore $ignoreContent

# 3. Initialize new repo
Write-Host "Initializing new Git repository..."
git init
git config user.email "hid05@app.com"
git config user.name "Hid"

# 4. Add files (ignoring secrets)
Write-Host "Adding files..."
git add .

# 5. Commit
Write-Host "Committing..."
git commit -m "Fresh Deploy V1"

# 6. Push
Write-Host "Pushing to GitHub..."
git branch -M main
git remote add origin https://github.com/hid0504154438-maker/workout-app.git
git push -u origin main --force

Write-Host "Done! Check if the push succeeded." -ForegroundColor Green
