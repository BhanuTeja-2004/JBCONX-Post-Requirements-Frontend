"""
End-to-end navigation & form tests for the JBCONX Post Requirements prototype.
Run:  python tests/e2e_flows.py dist/index.html [out_dir]
Requires: pip install playwright && playwright install chromium
"""
import sys, os, json
from playwright.sync_api import sync_playwright, expect

DIST = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else 'test-results'
os.makedirs(OUT, exist_ok=True)
results = []

def record(name, ok, note=''):
    results.append({'test': name, 'result': 'PASS' if ok else 'FAIL', 'note': note})
    print(('PASS ' if ok else 'FAIL ') + name + (f' — {note}' if note else ''))

def run(platform, pw):
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 900, 'height': 1000})
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(f'file://{DIST}?platform={platform}')
    dev = pg.locator('.device')
    P = platform
    def shot(n): dev.screenshot(path=f'{OUT}/{P}_{n}.png')
    def tap(text, exact=False): dev.get_by_role('button', name=text, exact=exact).first.click()
    def cont(): dev.locator('.bottombar .btn.primary').first.click()
    def chip(text): dev.locator('.chip', has_text=text).first.click()

    # reset
    pg.get_by_role('button', name='✕ Reset demo (clear drafts & requirements)').click()

    # ---------- Flow 1: Individual professional (signed in) ----------
    try:
        dev.locator('.cat-card').nth(0).click()
        expect(dev.locator('.progress-text')).to_contain_text('Step 1 of 4')
        cont()  # validation
        expect(dev.locator('.err-text').first).to_be_visible()
        record(f'{P}: Individual — validation blocks empty Service step', True)
        shot('ind_01_validation')
        dev.locator('.tile', has_text='Electrician').click()
        chip('Fan & light fitting')
        shot('ind_02_service')
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 2 of 4')
        dev.locator('textarea').fill('Short')
        cont()
        expect(dev.locator('.err-text', has_text='at least 20')).to_be_visible()
        record(f'{P}: Individual — description min length enforced', True)
        dev.locator('textarea').fill('Install three ceiling fans in hall and two bedrooms. Points exist.')
        dev.locator('.chip', has_text='In 2–3 days').click()
        dev.locator('.add-tile').click()
        if P == 'ios':
            dev.get_by_role('button', name='Use Sample Photo (Demo)').click()
        else:
            dev.locator('.row', has_text='Use sample photo').click()
        expect(dev.locator('.thumb')).to_have_count(1)
        record(f'{P}: Individual — photo added via picker', True)
        pg.wait_for_timeout(1500)
        shot('ind_03_details')
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 3 of 4')
        cont()
        expect(dev.locator('.err-text', has_text='service location')).to_be_visible()
        dev.locator('.row', has_text='Enter address manually').click()
        dev.get_by_role('button', name='Save address').click()
        expect(dev.locator('.sheet .err-text').first).to_be_visible()
        record(f'{P}: Address sheet validates required fields', True)
        shot('ind_04_address_errors')
        f = dev.locator('.sheet input')
        f.nth(0).fill('Flat 4B'); f.nth(1).fill('Temple Street'); f.nth(2).fill('Kuppam'); f.nth(3).fill('Chittoor'); f.nth(4).fill('517425')
        dev.get_by_role('button', name='Save address').click()
        expect(dev.get_by_text('We serve this area')).to_be_visible()
        chip('Tomorrow'); chip('Morning')
        shot('ind_05_location')
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 4 of 4')
        # edit from review returns to review
        dev.get_by_role('button', name='Edit Service').click()
        expect(dev.locator('.bottombar .btn.primary')).to_contain_text('Save & return to review')
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 4 of 4')
        record(f'{P}: Review — Edit returns to Review', True)
        cont()  # consent missing
        expect(dev.locator('.err-text', has_text='agree')).to_be_visible()
        record(f'{P}: Review — consent required', True)
        dev.locator('.check-row').click()
        shot('ind_06_review')
        expect(dev.locator('.bottombar .btn.primary')).to_contain_text('Submit requirement')
        cont()
        expect(dev.get_by_text('Requirement submitted')).to_be_visible(timeout=5000)
        ref = dev.locator('.ref-box .id').inner_text()
        record(f'{P}: Individual — submitted (signed in, no OTP)', ref.startswith('JBX-'), ref)
        shot('ind_07_success')
        tap('Track requirement')
        expect(dev.locator('.timeline')).to_be_visible()
        shot('ind_08_detail')
        record(f'{P}: Tracking — detail timeline visible', True)
    except Exception as e:
        record(f'{P}: Individual flow', False, str(e)[:200]); shot('ind_fail')

    # ---------- Flow 2: Contractor + draft resume + failure/retry ----------
    try:
        pg.get_by_role('button', name='⟲ Go to landing screen').click()
        dev.locator('.cat-card').nth(1).click()
        dev.locator('.row', has_text='Civil / Construction').click()
        chip('New construction')
        cont()
        chip('Independent house')
        cont()
        expect(dev.locator('.err-text', has_text='area')).to_be_visible()
        expect(dev.locator('.err-text', has_text='floors')).to_be_visible()
        record(f'{P}: Contractor — conditional required fields (area, floors)', True)
        dev.locator('input[inputmode=numeric]').first.fill('1800')
        chip('G+1')
        dev.locator('textarea').fill('G+1 independent house on 30x40 plot, approved plan, full civil work.')
        chip('₹25 – 50 lakh'); chip('Within 1 month')
        dev.locator('.segmented button', has_text='Yes').click()
        shot('con_01_details')
        cont()
        # exit mid-flow and save draft
        if P == 'ios':
            dev.get_by_role('button', name='Cancel', exact=True).first.click()
            dev.get_by_role('button', name='Save Draft & Exit').click()
        else:
            dev.get_by_role('button', name='Close').click()
            dev.get_by_role('button', name='Save draft').click()
        expect(dev.get_by_text('Unfinished draft')).to_be_visible()
        shot('con_02_draft_card')
        record(f'{P}: Draft — saved on exit and shown on landing', True)
        dev.locator('.draft-card').get_by_role('button', name='Continue').click()
        expect(dev.locator('.progress-text')).to_contain_text('Step 3 of 4')
        record(f'{P}: Draft — resume returns to saved step', True)
        dev.locator('.row', has_text='Site').first.click()
        chip('Weekends')
        cont()
        dev.locator('.check-row').click()
        pg.get_by_role('switch', name='Fail next submit').click()
        cont()
        expect(dev.get_by_text('We couldn’t submit your requirement')).to_be_visible(timeout=5000)
        shot('con_03_failed')
        tap('Try again')
        expect(dev.get_by_text('Requirement submitted')).to_be_visible(timeout=5000)
        record(f'{P}: Submit failure → retry succeeds', True)
    except Exception as e:
        record(f'{P}: Contractor flow', False, str(e)[:200]); shot('con_fail')

    # ---------- Flow 3: Renovation as guest with OTP ----------
    try:
        pg.get_by_role('button', name='⟲ Go to landing screen').click()
        pg.get_by_role('switch', name='Signed in').click()
        dev.locator('.cat-card').nth(2).click()
        dev.locator('.tile', has_text='Kitchen').click()
        dev.locator('.tile', has_text='Structural changes').click()
        expect(dev.get_by_text('Site inspection needed.')).to_be_visible()
        record(f'{P}: Renovation — structural notice shown', True)
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 2 of 5')
        chip('Apartment'); chip('2 BHK')
        dev.locator('.segmented button').first.click()
        cont()
        dev.locator('textarea').fill('Modular kitchen with granite top and remove one non-load-bearing wall.')
        chip('₹3 – 8 lakh'); chip('Within 1 month')
        cont()
        dev.locator('.row', has_text='Enter address manually').click()
        f = dev.locator('.sheet input')
        f.nth(0).fill('12-4'); f.nth(1).fill('MG Road'); f.nth(2).fill('Banjara'); f.nth(3).fill('Hyderabad'); f.nth(4).fill('900021')
        dev.get_by_role('button', name='Save address').click()
        expect(dev.get_by_text('Not available in 900021 yet.')).to_be_visible()
        record(f'{P}: Unserviceable pincode state', True)
        shot('ren_01_unserviceable')
        dev.get_by_role('button', name='Change').click()
        dev.locator('.row', has_text='Use current location').click()
        dev.locator('.sheet').get_by_role('button', name='Continue').click()
        pg.wait_for_timeout(1200)
        dev.locator('.sheet input').nth(0).fill('Door 7')
        dev.get_by_role('button', name='Save address').click()
        cont()
        expect(dev.locator('.progress-text')).to_contain_text('Step 5 of 5')
        f = dev.locator('.rev-sec input')
        f.nth(0).fill('Lakshmi Devi'); f.nth(1).fill('9123456780')
        dev.locator('.check-row').click()
        expect(dev.locator('.bottombar .btn.primary')).to_contain_text('Continue to verify')
        cont()
        expect(dev.get_by_text('Confirm your mobile number')).to_be_visible()
        shot('ren_02_phone')
        tap('Send code')
        expect(dev.get_by_text('Enter the 6-digit code')).to_be_visible(timeout=4000)
        shot('ren_03_otp')
        dev.locator('.otp-wrap input').fill('111111')
        expect(dev.get_by_text('attempts left')).to_be_visible(timeout=4000)
        record(f'{P}: OTP — wrong code shows attempts left', True)
        shot('ren_04_otp_wrong')
        dev.locator('.otp-wrap input').fill('123456')
        expect(dev.get_by_text('Requirement submitted')).to_be_visible(timeout=8000)
        record(f'{P}: Guest OTP verify → submitted', True)
        tap('Track requirement') if False else None
        pg.get_by_role('button', name='⟲ Go to landing screen').click()
        dev.locator('.row', has_text='My requirements').click()
        pg.wait_for_timeout(900)
        n = dev.locator('.status-chip').count()
        record(f'{P}: My requirements lists all submissions', n >= 3, f'{n} items')
        shot('trk_01_list')
    except Exception as e:
        record(f'{P}: Renovation/OTP flow', False, str(e)[:200]); shot('ren_fail')

    # ---------- Offline ----------
    try:
        pg.get_by_role('button', name='⟲ Go to landing screen').click()
        pg.get_by_role('switch', name='Offline').click()
        expect(dev.locator('.offline-bar')).to_be_visible()
        record(f'{P}: Offline banner shown', True)
        pg.get_by_role('switch', name='Offline').click()
    except Exception as e:
        record(f'{P}: Offline', False, str(e)[:200])

    record(f'{P}: No runtime errors in console', not errors, '; '.join(errors)[:200])
    b.close()

with sync_playwright() as pw:
    for plat in ['android', 'ios']:
        run(plat, pw)

with open(f'{OUT}/results.json', 'w') as fh:
    json.dump(results, fh, indent=2, ensure_ascii=False)
fails = [r for r in results if r['result'] == 'FAIL']
print(f"\n{len(results) - len(fails)}/{len(results)} passed")
sys.exit(1 if fails else 0)
