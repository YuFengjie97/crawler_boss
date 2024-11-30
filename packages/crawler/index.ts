import { By, Builder, Browser, WebElement, WebDriver, until } from "selenium-webdriver";

(async () => {
  try {
    console.log(1111111111);

    const driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .build();
    driver.get('http://www.bilibli.com')

  } catch (e) {

  }

})()