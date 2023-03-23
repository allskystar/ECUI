# coding=utf-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementClickInterceptedException
import unittest,test,time
class TestUIBase(test.TestSelenium):
	def tearDown(self):
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML=''")
	def test_button(self):
		self.driver.execute_script("m.innerHTML='<form name=\"demo\"></form><form name=\"test\"><div ui=\"type:button;id:test\">Button</div></form>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-button")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getForm().name"), "test")
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<form name=\"demo\"></form><div ui=\"type:button;id:test\">Button</div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getForm()"), None)
	def test_options(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:options;id:test\"><div>Options0</div><div>Options1</div><div>Options2</div></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').onchange=function(e){log(this.getSelected().getContent())}")
		self.driver.execute_script("ecui.get('test').onpropertychange=function(e){log(e.name+':'+(e.history?e.history.getContent():'')+':'+e.item.getContent())}")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-options")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected()"), None)
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getLength()"), 3)
		self.driver.execute_script("return ecui.get('test').getItem(1).getMain()").click()
		self.assertEqual(self.logs.text, "selected::Options1\nOptions1")
		self.clearLogs()
		self.assertEqual(
			self.driver.execute_script("return ecui.get('test').getSelected().getMain()"),
			self.driver.find_elements(By.CSS_SELECTOR, "#main>div>div")[1]
		)
		self.driver.execute_script("return ecui.get('test').getItem(2).getMain()").click()
		self.assertEqual(self.logs.text, "selected:Options1:Options2\nOptions2")
		self.assertEqual(
			self.driver.execute_script("return ecui.get('test').getSelected().getMain()"),
			self.driver.find_elements(By.CSS_SELECTOR, "#main>div>div")[2]
		)
		self.clearLogs()
	def test_popup_menu(self):
		ret = self.driver.get_window_size()
		self.driver.set_window_size(600, ret['height'])
		self.driver.execute_script("m.innerHTML='<ul ui=\"type:popup-menu;id:test\" style=\"width:160px\"><ul style=\"width:160px\"><li>Level0</li><ul style=\"width:160px\"><li>Level1</li><ul style=\"width:160px\"><li>Level2</li><ul style=\"width:160px\"><li>Level3</li><li>Level4</li></ul></ul></ul></ul></ul>'")
		elem = self.driver.find_elements(By.CSS_SELECTOR, "ul")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-popupmenu")
		self.assertTrue(self.driver.execute_script("return document.getElementsByTagName('li')[0].classList.contains('ui-popupmenu-item-group')"), )
		self.assertTrue(self.driver.execute_script("return document.getElementsByTagName('li')[3].classList.contains('ui-popupmenu-item-group')"), )
		self.assertFalse(self.driver.execute_script("return document.getElementsByTagName('li')[4].classList.contains('ui-popupmenu-item-group')"), )
		ActionChains(self.driver).move_to_element(elem[0]).perform()
		ActionChains(self.driver).move_to_element(elem[1]).perform()
		ActionChains(self.driver).move_to_element(elem[2]).perform()
		ActionChains(self.driver).move_to_element(elem[3]).perform()
		self.assertEqual(elem[1].rect['x'], 156)
		self.assertEqual(elem[2].rect['x'], 312)
		self.assertEqual(elem[3].rect['x'], 156)
		self.assertEqual(elem[4].rect['x'], 312)
		ActionChains(self.driver).move_to_element(elem[0]).perform()
		self.assertFalse(elem[2].is_displayed())
		self.driver.set_window_size(ret['width'], ret['height'])
	def test_image(self):
		self.driver.execute_script("m.innerHTML='<img ui=\"type:image;id:test\" width=\"200\" src=\"images/ecui/fail.png\">'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-image")
		elem = self.driver.execute_script("return ecui.get('test').getMain()")
		ret = elem.rect
		ActionChains(self.driver).move_to_element_with_offset(elem, 10, 10).perform()
		self.driver.execute_script("mousewheel(-5,0)")
		ret = elem.rect
		self.assertEqual([ret['width'], ret['height']], [210, 158])
		self.driver.execute_script("mousewheel(20,0)")
		ret = elem.rect
		self.assertEqual([ret['width'], ret['height']], [200, 150])
	def test_img_fill(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:img-fill;id:test\" style=\"width:750px;height:750px\"><img src=\"images/ecui/fail.png\"></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-img-fill")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getMain().firstElementChild.style.top"), "94px")
		self.driver.execute_script("ecui.get('test').setSize(1000,562)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getMain().firstElementChild.style.left"), "125px")
	def test_signature(self):
		self.driver.execute_script("m.innerHTML='<canvas ui=\"type:signature;id:test\" style=\"width:50px;height:50px\"></canvas>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-signature")
		ret = self.driver.execute_script("return ecui.get('test').toDataURL()")
		elem = self.driver.execute_script("return ecui.get('test').getMain()")
		ActionChains(self.driver).move_to_element_with_offset(elem, 5, 5).move_to_element_with_offset(elem, 0, 0).perform()
		self.assertEqual(self.driver.execute_script("return ecui.get('test').toDataURL()"), ret)
		ActionChains(self.driver).click_and_hold().move_to_element_with_offset(elem, 15, 15).release().perform()
		self.assertNotEqual(self.driver.execute_script("return ecui.get('test').toDataURL()"), ret)
		self.driver.execute_script("ecui.get('test').clear()")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').toDataURL()"), ret)
	def test_month_view(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:month-view;id:test;date:2022-10-13;begin:2022-10-08;end:2022-10-20;extra:disable\"></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-monthview")
		self.driver.execute_script("ecui.get('test').ondateclick=function(e){log(ecui.util.formatDate(e.date,'yyyy-MM-dd'))}")
		elem = self.driver.find_elements(By.CSS_SELECTOR, "#main td")
		self.assertEqual(elem[0].text, self.str("日"))
		self.assertEqual(elem[7].text, "25")
		elem[19].click()
		elem[20].click()
		elem[32].click()
		elem[33].click()
		self.assertEqual(self.logs.text, "2022-10-08\n2022-10-20")
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').setRange(new Date('2022-09-01 00:00:00'),new Date('2022-12-01 00:00:00'))")
		elem[19].click()
		elem[20].click()
		elem[32].click()
		elem[33].click()
		self.assertEqual(self.logs.text, "2022-10-07\n2022-10-08\n2022-10-20\n2022-10-21")
		self.clearLogs()
		elem[12].click()
		elem[13].click()
		elem[43].click()
		elem[44].click()
		self.assertEqual(self.logs.text, "2022-10-01\n2022-10-31")
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').setExtraCapture(true)")
		elem[12].click()
		elem[13].click()
		elem[43].click()
		elem[44].click()
		self.assertEqual(self.logs.text, "2022-09-30\n2022-10-01\n2022-10-31\n2022-11-01")
		self.clearLogs()
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:month-view;id:test;date:2022-10-13;weekday:1\" style=\"width:50px;height:50px\"></canvas>'")
		self.driver.execute_script("ecui.init(m)")
		elem = self.driver.find_elements(By.CSS_SELECTOR, "#main td")
		self.assertEqual(elem[7].text, "26")
		self.driver.execute_script("ecui.get('test').move(3)")
		self.assertEqual(elem[12].text, "31")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getYear() + '-' + ecui.get('test').getMonth()"), "2023-1")
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[10].classList.contains('ui-extra')"))
		self.driver.execute_script("ecui.get('test').move(-1)")
		self.assertEqual(elem[7].text, "28")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getYear() + '-' + ecui.get('test').getMonth()"), "2022-12")
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[10].classList.contains('ui-extra')"))
	def test_calendar(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:calendar;id:test;date:2022-10-13\"></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-calendar")
		elem = self.driver.find_element(By.CLASS_NAME, "ui-calendar-title")
		self.assertEqual(elem.text, self.str("2022年10月"))
		self.driver.find_element(By.CLASS_NAME, "ui-calendar-prev-year").click()
		self.assertEqual(elem.text, self.str("2021年10月"))
		self.driver.find_element(By.CLASS_NAME, "ui-calendar-prev-month").click()
		self.assertEqual(elem.text, self.str("2021年9月"))
		self.driver.find_element(By.CLASS_NAME, "ui-calendar-next-year").click()
		self.assertEqual(elem.text, self.str("2022年9月"))
		self.driver.find_element(By.CLASS_NAME, "ui-calendar-next-month").click()
		self.assertEqual(elem.text, self.str("2022年10月"))
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getTitle()"), elem)
	def test_range_calendar(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:range-calendar;id:test;date:2022-10-13\"></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-range-calendar")
		elem = self.main.find_elements(By.CSS_SELECTOR, "td")
		elem[20].click()
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[20].classList.contains('ui-monthview-date-selected')"))
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[20].classList.contains('ui-date-start')"))
		ActionChains(self.driver).move_to_element(elem[19]).perform()
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[19].classList.contains('ui-date-start')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[20].classList.contains('ui-date-end')"))
		ActionChains(self.driver).move_to_element(elem[27]).perform()
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[20].classList.contains('ui-date-start')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[21].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[22].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[23].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[24].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[25].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[26].classList.contains('ui-date-mid')"))
		self.assertTrue(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[27].classList.contains('ui-date-end')"))
		elem[27].click()
		ActionChains(self.driver).move_to_element(elem[28]).perform()
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[27].classList.contains('ui-date-mid')"))
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[28].classList.contains('ui-date-end')"))
		elem[27].click()
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[20].classList.contains('ui-date-start')"))
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[25].classList.contains('ui-date-mid')"))
		self.assertFalse(self.driver.execute_script("return ecui.$('main').getElementsByTagName('td')[27].classList.contains('ui-date-end')"))
		elem = self.driver.find_element(By.CLASS_NAME, "ui-range-calendar-title")
		self.assertEqual(elem.text, self.str("2022年10月 至 2022年11月"))
		self.driver.find_element(By.CLASS_NAME, "ui-range-calendar-prev").click()
		self.assertEqual(elem.text, self.str("2022年9月 至 2022年10月"))
		self.driver.find_element(By.CLASS_NAME, "ui-range-calendar-next").click()
		self.assertEqual(elem.text, self.str("2022年10月 至 2022年11月"))
	def test_tab(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:tab;id:test;selected:1\"><div><strong>Title0</strong>Content0</div><strong>Title1</strong><div><strong>Title2</strong>Content2</div><div><strong>Title3</strong>Content3</div></div>'")
		self.driver.execute_script("ecui.init(m)")
		elem = self.driver.find_elements(By.CSS_SELECTOR, ".ui-tab strong")
		self.driver.execute_script("ecui.get('test').ontitleclick=function(e){log('titleclick:' + e.item.getContent())}")
		self.driver.execute_script("ecui.get('test').oncontainerclick=function(e){log('containerclick:' + e.item.getContainer().textContent)}")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-tab")
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(0).getMain().classList.contains('ui-tab-item')"))
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), elem[1])
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(1).getMain().classList.contains('ui-tab-item-selected')"))
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getContainer()"), None)
		elem[0].click()
		ret = self.driver.execute_script("return ecui.get('test').getSelected().getContainer()")
		ret.click()
		self.assertEqual(self.logs.text, "titleclick:Title0\ncontainerclick:Content0")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), elem[0])
		self.assertTrue(ret.is_displayed())
		elem[2].click()
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), elem[2])
		self.assertFalse(ret.is_displayed())
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').remove(2)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), elem[3])
		self.driver.execute_script("ecui.get('test').remove(2)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), elem[1])
		self.driver.execute_script("ecui.get('test').remove(1);ecui.get('test').remove(0)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected()"), None)
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:tab;id:test\"><div><strong>Title0</strong>Content0</div><strong ui=\"selected:true\">Title1</strong></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), self.driver.find_elements(By.CSS_SELECTOR, ".ui-tab strong")[1])
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:tab;id:test\"><div><strong>Title0</strong>Content0</div><strong>Title1</strong></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getSelected().getMain()"), self.driver.find_elements(By.CSS_SELECTOR, ".ui-tab strong")[0])
	def test_steps(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:steps;id:test\"><div><strong>Title0</strong>Content0</div><strong>Title1</strong><strong>Title2</strong><strong>Title3</strong></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-steps")
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(0).getMain().classList.contains('ui-steps-item-ready')"))
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getItem(1).getMain().classList.contains('ui-steps-item-ready')"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(0).getContainer().classList.contains('ui-steps-item-selected')"))
		self.driver.execute_script("ecui.get('test').next()")
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(1).getMain().classList.contains('ui-steps-item-ready')"))
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getItem(0).getContainer().classList.contains('ui-steps-item-selected')"))
		self.driver.execute_script("ecui.get('test').prev()")
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getItem(1).getMain().classList.contains('ui-steps-item-ready')"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getItem(0).getContainer().classList.contains('ui-steps-item-selected')"))
	def test_timer(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:timer;id:test;immediate:true;time:1\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').onfinish=function(e){log('finish')}")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-timer")
		time.sleep(2)
		self.assertEqual(self.logs.text, "finish")
		self.clearLogs()
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:timer;id:test;time:1\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').onfinish=function(e){log('finish')}")
		time.sleep(2)
		self.assertEqual(self.logs.text, "")
		self.driver.execute_script("ecui.get('test').start()")
		time.sleep(2)
		self.assertEqual(self.logs.text, "finish")
		self.clearLogs()
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:timer;id:test;time:1\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').onfinish=function(e){log('finish')}")
		self.driver.execute_script("ecui.get('test').start()")
		self.driver.execute_script("ecui.get('test').stop()")
		time.sleep(2)
		self.assertEqual(self.logs.text, "")
		self.driver.execute_script("ecui.get('test').start()")
		time.sleep(2)
		self.assertEqual(self.logs.text, "finish")
		self.clearLogs()
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:timer;id:test;time:100\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getContent()"), "00:01:40")
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:timer;id:test;time:100;format:{$}\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getContent()"), "100")
	def test_clock(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:clock;id:test\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-clock")
	def test_progress(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:progress;id:test\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').onprogress=function(){log(this.getValue())}")
		self.driver.execute_script("ecui.get('test').setValue(30)")
		self.assertEqual(self.logs.text, "30")
		self.clearLogs()
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:progress-bar;id:test\">{2}%<div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-progress-bar")
		self.driver.execute_script("ecui.get('test').setValue(50)")
		self.assertEqual(self.driver.find_element(By.CLASS_NAME, "ui-progress-bar-text").text, "50.00%")
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<div ui=\"type:progress-circle;id:test\"><div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-progress-circle")
	def test_dialog(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:dialog;id:test0\" class=\"ui-hide\" style=\"width:100px;height:100px\"><strong>Title0</strong>Content0</div><div ui=\"type:dialog;id:test1\" class=\"ui-hide\" style=\"width:100px;height:100px\"><strong>Title1</strong>Content1</div><div ui=\"type:dialog;id:test2\" class=\"ui-hide\" style=\"width:100px;height:100px\"><strong>Title2</strong>Content2</div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test0').getType()"), "ui-dialog")
		self.assertTrue(self.driver.execute_script("return ecui.get('test0').$getSection('Title').getMain().classList.contains('ui-dialog-title')"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test0').$getSection('Close').getMain().classList.contains('ui-dialog-close')"))
		self.driver.execute_script("ecui.get('test0').show();ecui.get('test1').show();ecui.get('test2').show();ecui.get('test2').setPosition(100,100)")
		self.assertEqual(self.driver.find_element(By.CSS_SELECTOR, "#main .ui-dialog-title").text, "Title0")
		self.assertTrue(self.driver.execute_script("return ecui.get('test0').getMain().style.zIndex<ecui.get('test1').getMain().style.zIndex"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test1').getMain().style.zIndex<ecui.get('test2').getMain().style.zIndex"))
		self.driver.find_elements(By.CLASS_NAME, "ui-dialog")[1].click()
		self.assertTrue(self.driver.execute_script("return ecui.get('test0').getMain().style.zIndex<ecui.get('test2').getMain().style.zIndex"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test2').getMain().style.zIndex<ecui.get('test1').getMain().style.zIndex"))
		self.driver.execute_script("ecui.get('test0').setTitle('Title')")
		self.assertEqual(self.driver.find_element(By.CSS_SELECTOR, "#main .ui-dialog-title").text, "Title")
		self.driver.execute_script("ecui.get('test1').hide();ecui.get('test1').showModal()")
		self.assertRaises(ElementClickInterceptedException, lambda driver: driver.find_elements(By.CLASS_NAME, "ui-dialog")[2].click(), self.driver)
		self.driver.execute_script("ecui.get('test1').hide()")
		self.assertFalse(self.driver.find_elements(By.CLASS_NAME, "ui-dialog")[1].is_displayed())
		ret = self.driver.find_element(By.CLASS_NAME, "ui-dialog").rect
		ActionChains(self.driver).move_to_element(self.driver.find_element(By.CLASS_NAME, "ui-dialog-title")).click_and_hold().move_to_element_with_offset(self.driver.find_element(By.CLASS_NAME, "ui-dialog"), 100, 100).release().perform()
		self.assertNotEqual(ret, self.driver.find_element(By.CLASS_NAME, "ui-dialog").rect)
	def test_tree_view(self):
		self.driver.execute_script("m.innerHTML='<ul ui=\"type:tree-view;id:test;collapsed:false\"><li>Root</li><li>Child0</li><li>Child1</li><ul class=\"ui-hide\"><li>Child2</li><li>Son0</li><li>Son1</li><li>Son2</li></ul></ul>'")
		self.driver.execute_script("ecui.init(m)")
		self.driver.execute_script("ecui.get('test').oncollapse=function(e){log(e.type)};ecui.get('test').onexpand=function(e){log(e.type)}")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-treeview")
		self.assertFalse(self.driver.execute_script("return ecui.get('test').isCollapsed()"))
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getChild(2).isCollapsed()"))
		elem = self.driver.find_element(By.CSS_SELECTOR, "#main>.ui-treeview")
		elem.click()
		self.assertTrue(self.driver.execute_script("return ecui.get('test').isCollapsed()"))
		elem.click()
		self.assertFalse(self.driver.execute_script("return ecui.get('test').isCollapsed()"))
		self.assertEqual(self.logs.text, "collapse\nexpand")
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').hide()")
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getContainer()").is_displayed())
		self.driver.execute_script("ecui.get('test').show()")
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getContainer()").is_displayed())
		self.driver.execute_script("ecui.get('test').getChild(2).hide();ecui.get('test').getChild(2).show()")
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getChild(2).getContainer()").is_displayed())
		self.driver.execute_script("ecui.get('test').getChild(0).add('Temp0');ecui.get('test').getChild(0).add('Temp2');ecui.get('test').getChild(0).add('Temp1',1)")
		self.driver.execute_script("ecui.get('test').forEach(function(e){log(e.getContent())})")
		self.assertEqual(self.driver.execute_script("return ecui.$('logs').textContent"), "Root\nChild0\nChild1\nChild2\nTemp0\nTemp1\nTemp2\nSon0\nSon1\nSon2")
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').getChild(0).remove(1).dispose()")
		self.driver.execute_script("ecui.get('test').forEach(function(e){log(e.getContent())})")
		self.assertEqual(self.driver.execute_script("return ecui.$('logs').textContent"), "Root\nChild0\nChild1\nChild2\nTemp0\nTemp2\nSon0\nSon1\nSon2")
		self.clearLogs()
		self.driver.execute_script("ecui.get('test').getChild(0).removeAll(true)")
		self.driver.execute_script("ecui.get('test').forEach(function(e){log(e.getContent())})")
		self.assertEqual(self.driver.execute_script("return ecui.$('logs').textContent"), "Root\nChild0\nChild1\nChild2\nSon0\nSon1\nSon2")
		self.clearLogs()
	def test_pyramid_tree(self):
		self.driver.execute_script("m.innerHTML='<div ui=\"type:pyramid-tree;id:test\"><ul><li>Root</li><li>Child0</li><ul class=\"ui-hide\"><li>Child1</li><li>Son0</li><li>Son1</li><li>Son2</li></ul><ul class=\"ui-hide\"><li>Child2</li><li>Son3</li><li>Son4</li><li>Son5</li></ul></ul></div>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-pyramid-tree")
		ret = self.driver.execute_script("return ecui.get('test').$getSection('Tree').getChild(2).getMain()").rect
		self.driver.execute_script("return ecui.get('test').$getSection('Tree').getChild(1).getMain()").click()
		self.assertEqual(ret, self.driver.execute_script("return ecui.get('test').$getSection('Tree').getChild(2).getMain()").rect)
		self.driver.execute_script("return ecui.get('test').$getSection('Tree').getChild(2).getMain()").click()
		self.assertNotEqual(ret, self.driver.execute_script("return ecui.get('test').$getSection('Tree').getChild(2).getMain()").rect)
	def test_table(self):
		self.driver.execute_script("m.innerHTML='<table ui=\"type:table;id:test\"><thead><tr><th>Name0</th><th>Name1</th><th>Name2</th></tr></thead><tbody><tr><td rowspan=\"2\">Cell-0-0</td><td colspan=\"2\">Cell-0-1</td></tr><tr><td>Cell-1-1</td><td>Cell-1-2</td></tr><tr><td>Cell-2-0</td><td>Cell-2-1</td><td>Cell-2-2</td></tr></tbody></table>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-table")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(0,0).getContent()"), "Cell-0-0")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(1,0)"), None)
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(0,1).getContent()"), "Cell-0-1")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(0,2)"), None)
		self.driver.execute_script("ecui.get('test').getHCell(1).hide()")
		elem = self.driver.execute_script("return ecui.get('test').getCell(0,1).getMain()")
		self.assertTrue(elem.is_displayed())
		self.assertEqual(elem.get_attribute("colSpan"), "1")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(0,2)"), None)
		self.driver.execute_script("ecui.get('test').getHCell(1).show();ecui.get('test').getRow(0).hide()")
		self.assertEqual(elem.get_attribute("colSpan"), "2")
		elem = self.driver.execute_script("return ecui.get('test').getCell(0,0).getMain()")
		self.assertTrue(elem.is_displayed())
		self.assertEqual(elem.get_attribute("rowSpan"), "1")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(1,0)"), None)
		self.driver.execute_script("ecui.get('test').getRow(0).show()")
		self.assertEqual(elem.get_attribute("rowSpan"), "2")
		self.driver.execute_script("ecui.dispose(m)")
		self.driver.execute_script("m.innerHTML='<table ui=\"type:inline-table;id:test\"><thead><tr><th>Name0</th><th>Name1</th><th>Name2</th></tr></thead><tbody><tr><td>Cell-0-0</td><td>Cell-0-1</td><td>Cell-0-2</td></tr><tr><td colspan=\"3\">Expand0</td></tr><tr><td>Cell-1-0</td><td>Cell-1-1</td><td>Cell-1-2</td></tr><tr><td colspan=\"3\">Expand1</td></tr></tbody></table>'")
		self.driver.execute_script("ecui.init(m)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getType()"), "ui-inline-table")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getCell(1,0).getContent()"), "Cell-1-0")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getExtendRow(1).getMain().textContent"), "Expand1")
		self.driver.execute_script("ecui.get('test').addRow(['Cell-2-0','Cell-2-1','Cell-2-2'])")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getExtendRow(2).getMain().textContent"), "")
		self.driver.execute_script("ecui.get('test').getExtendRow(2).getCell(0).setContent('Expand2');window.a=ecui.get('test').removeRow(2)")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getRow(2)"), None)
		self.driver.execute_script("ecui.get('test').addRow(window.a);delete window.a")
		self.assertEqual(self.driver.execute_script("return ecui.get('test').getExtendRow(2).getMain().textContent"), "Expand2")
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getExtendRow(2).getMain()").is_displayed())
		self.driver.execute_script("return ecui.get('test').getRow(2).getMain()").click()
		self.assertTrue(self.driver.execute_script("return ecui.get('test').getExtendRow(2).getMain()").is_displayed())
		self.driver.execute_script("return ecui.get('test').getRow(2).getMain()").click()
		self.assertFalse(self.driver.execute_script("return ecui.get('test').getExtendRow(2).getMain()").is_displayed())

unittest.main(argv=[''])
