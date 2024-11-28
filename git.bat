@echo off

:begin
cls
echo Do you want to add files to git?
echo 1. Add all files
echo 2. Add specific files
echo 3. Exit
set /p choice="Choose an option (1, 2, or 3): "

if "%choice%" == "1" (
    git add .
    goto commit
) else if "%choice%" == "2" (
    set /p files="Enter the files you want to add (space separated): "
    if "%files%" == "" (
        echo No files specified. Returning to main menu...
        pause
        goto begin
    )
    git add %files%
    goto commit
) else if "%choice%" == "3" (
    exit
) else (
    echo Invalid choice. Please enter 1, 2, or 3.
    pause
    goto begin
)

:commit
cls
call git status
echo.
echo The above files are staged for commit.
set /p commitMsg="Enter a commit message (or press Enter for 'General update'): "

if "%commitMsg%" == "" (
    set commitMsg=General update
)

call git commit -m "%commitMsg%"
echo.
echo Press Enter to push changes...
pause >nul
goto push

:push
cls
call git push
echo.
echo Push complete.
pause

goto begin
