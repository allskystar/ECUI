from selenium import webdriver
from selenium.webdriver.common.by import By
import unittest,sys,time,re,types

def waitUrl(self, url):
	while self.current_url != url:
		time.sleep(0.1)
def waitElement(self, by, desc):
	while 1:
		try:
			self.find_element(by, desc)
			break
		except:
			time.sleep(0.1)
def initWebDriver(driver):
	driver.waitUrl = types.MethodType(waitUrl, driver)
	driver.waitElement = types.MethodType(waitElement, driver)

class TestSelenium(unittest.TestCase):
	@classmethod
	def setUpClass(self):
		self.maxDiff = 5000
		if len(sys.argv) == 1:
			type = "chrome"
		else:
			type = sys.argv[1]
		if type == "safari":
			self.driver = webdriver.Safari()
		elif type == "firefox":
			options = webdriver.FirefoxOptions()
			options.add_argument("-headless")
			options.add_argument("--disable-gpu")
			self.driver = webdriver.Firefox(options=options,service_log_path="/dev/null")
		else:
			options = webdriver.ChromeOptions()
			options.add_argument("--headless")
			options.add_argument("--disable-gpu")
			options.add_argument("--disable-blink-features=AutomationControlled")
			options.add_experimental_option("excludeSwitches", ["enable-automation"])
			self.driver = webdriver.Chrome(options=options)
		initWebDriver(self.driver)
		self.driver.get("http://localhost/ECUI/test.html")
		self.main = self.driver.find_element(By.ID, "main")
		self.logs = self.driver.find_element(By.ID, "logs")
		self.driver.execute_script("window.m=ecui.$('main');window.dom=ecui.dom")
	@classmethod
	def tearDownClass(self):
		self.driver.quit()
	def formatColor(self, color):
		ret = re.match(r'rgb\((\d+), (\d+), (\d+)\)', color, re.M)
		if ret:
			color = 'rgba(' + ret.group(1) + ', ' + ret.group(2) + ', ' + ret.group(3) + ', 1)'
		return color
	def clearLogs(self):
		self.driver.execute_script("ecui.$('logs').innerHTML=''")
	def waitLogs(self):
		while len(self.logs.text) == 0:
			time.sleep(1)
	def str(self, value):
		if sys.version_info < (3, 0):
			return value.decode("utf-8")
		return value
