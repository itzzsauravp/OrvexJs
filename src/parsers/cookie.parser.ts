export function cookieParser(raw_cookies: string) {
  let cookies = {};

  raw_cookies
    .split(";")
    .map((item) => item.split("="))
    .map((each) => {
      const key = each[0].trim();
      const value = each[1].trim();
      cookies = { ...cookies, [key]: value };
    });

  return cookies;
}
