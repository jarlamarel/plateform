# Script pour revenir à la dernière version commitée
Write-Host "🔄 Retour à la dernière version commitée" -ForegroundColor Green

Write-Host "`n📋 Options disponibles:" -ForegroundColor Yellow
Write-Host "1. Voir l'état actuel (git status)" -ForegroundColor White
Write-Host "2. Annuler toutes les modifications non commitées" -ForegroundColor White
Write-Host "3. Annuler seulement les fichiers spécifiques" -ForegroundColor White
Write-Host "4. Voir l'historique des commits" -ForegroundColor White
Write-Host "5. Revenir à un commit spécifique" -ForegroundColor White

$choice = Read-Host "`nChoisissez une option (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n📊 État actuel du repository:" -ForegroundColor Blue
        git status
    }
    "2" {
        Write-Host "`n⚠️ ATTENTION: Cette action va supprimer toutes les modifications non commitées!" -ForegroundColor Red
        $confirm = Read-Host "Êtes-vous sûr ? (oui/non)"
        if ($confirm -eq "oui") {
            Write-Host "`n🔄 Annulation de toutes les modifications..." -ForegroundColor Blue
            git reset --hard HEAD
            Write-Host "✅ Modifications annulées avec succès!" -ForegroundColor Green
        } else {
            Write-Host "❌ Opération annulée" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host "`n📝 Annulation des fichiers spécifiques:" -ForegroundColor Blue
        Write-Host "Fichiers à annuler:" -ForegroundColor White
        Write-Host "- frontend-service/src/services/api.ts" -ForegroundColor White
        Write-Host "- frontend-service/src/services/course.service.ts" -ForegroundColor White
        Write-Host "- frontend-service/.env" -ForegroundColor White
        
        $confirm = Read-Host "`nAnnuler ces fichiers ? (oui/non)"
        if ($confirm -eq "oui") {
            git checkout -- frontend-service/src/services/api.ts
            git checkout -- frontend-service/src/services/course.service.ts
            if (Test-Path "frontend-service\.env") {
                Remove-Item "frontend-service\.env"
            }
            Write-Host "✅ Fichiers annulés avec succès!" -ForegroundColor Green
        }
    }
    "4" {
        Write-Host "`n📜 Historique des commits:" -ForegroundColor Blue
        git log --oneline -10
    }
    "5" {
        Write-Host "`n📜 Historique des commits:" -ForegroundColor Blue
        git log --oneline -10
        $commitHash = Read-Host "`nEntrez le hash du commit (ex: abc1234)"
        if ($commitHash) {
            Write-Host "⚠️ ATTENTION: Cette action va supprimer toutes les modifications!" -ForegroundColor Red
            $confirm = Read-Host "Êtes-vous sûr ? (oui/non)"
            if ($confirm -eq "oui") {
                git reset --hard $commitHash
                Write-Host "✅ Retour au commit $commitHash avec succès!" -ForegroundColor Green
            }
        }
    }
    default {
        Write-Host "❌ Option invalide" -ForegroundColor Red
    }
}

Write-Host "`n✅ Opération terminée!" -ForegroundColor Green
Read-Host "Appuyez sur Entrée pour continuer..."
