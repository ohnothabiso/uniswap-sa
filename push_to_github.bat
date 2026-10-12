@echo off
echo ========================================================
echo   UniSwap SA - Deploy to GitHub
echo ========================================================
echo.
echo Pushing local main branch to https://github.com/ohnothabiso/uniswap-sa.git ...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code successfully deployed to GitHub!
    echo Repository URL: https://github.com/ohnothabiso/uniswap-sa
) else (
    echo [NOTICE] If this failed, make sure you created the empty repo 'uniswap-sa' on GitHub:
    echo   https://github.com/new
)
echo.
pause
