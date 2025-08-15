export const HARAJ_LOGIN_URL = "https://haraj.com.sa/login";
export const SAKAN_LOGIN_URL = "https://sakan.com/login";

export const BROWSER_SETTINGS = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920x1080"
  ],
  defaultViewport: null
};