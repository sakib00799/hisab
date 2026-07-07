# VAT compliance verification checklist

Before public launch, a licensed Bangladesh accountant (budget BDT 500–1,000)
must review the items below. Record their name, date, and sign-off at the
bottom.

## How to prepare the review samples

1. On staging, create a test company with a real-format BIN.
2. Create 3 invoices in one month (mix of 15%, 7.5%, and 0% VAT lines).
3. Add 2 expenses with input VAT in the same month.
4. Download the invoice PDF (`/api/invoices/{id}/pdf`) and the Mushak 9.1 PDF
   (`/api/vat/{year}/{month}/pdf`, requires Business plan — upgrade the test
   company row in the `Subscription` table or via SSLCommerz sandbox).

## Mushak 6.3 — Tax invoice

- [ ] Header shows seller name, address, and BIN exactly as NBR expects
- [ ] Invoice number format acceptable (sequential, no gaps within month)
- [ ] Issue date present and unambiguous (DD/MM/YYYY)
- [ ] Customer name shown; customer BIN shown when provided (B2B)
- [ ] Line items show description, quantity, unit price, VAT rate, VAT amount
- [ ] Subtotal, VAT total, and grand total labelled correctly in BDT
- [ ] Field placement matches current NBR Mushak 6.3 layout
- [ ] Bengali labels needed? (If yes: file an issue — requires Bengali font in PDF)

## Mushak 9.1 — Monthly VAT return

- [ ] Output VAT equals the sum of VAT on all non-cancelled sales invoices
- [ ] Input VAT equals the sum of VAT on all recorded purchase expenses
- [ ] Net payable = Output − Input (negative shown as carry-forward credit)
- [ ] Output and input registers list the right documents for the period
- [ ] Filing deadline shown as the 27th of the following month
- [ ] Structure usable for actual NBR online/paper filing

## Calculation spot-check (do by hand)

- [ ] Pick one month; recompute Output − Input = Net on paper and compare
- [ ] One invoice with 7.5% truncated rate rounds correctly (2 decimal places)
- [ ] A month with zero invoices shows 0 / 0 / 0, not errors

## Sign-off

| Field | Value |
| --- | --- |
| Reviewer name | |
| Qualification / firm | |
| Date | |
| Result | Approved / Approved with notes / Rejected |
| Notes | |
