from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        print("Navigating to http://localhost:3000/login...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')
        
        print("Taking screenshot...")
        page.screenshot(path='artifacts/login_inspect.png', full_page=True)
        
        print("Page Title:", page.title())
        
        # Discover buttons and inputs
        buttons = page.locator('button').all()
        print(f"Found {len(buttons)} buttons:")
        for i, btn in enumerate(buttons):
            print(f"  {i}: {btn.text_content()} | role: {btn.get_attribute('role')}")
            
        inputs = page.locator('input').all()
        print(f"Found {len(inputs)} inputs:")
        for i, inp in enumerate(inputs):
            print(f"  {i}: name={inp.get_attribute('name')} | type={inp.get_attribute('type')} | id={inp.get_attribute('id')}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()
