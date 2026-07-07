# Beta program runbook (10 users)

Goal: validate the core flow (signup → onboarding → invoice → VAT) with real
Dhaka business owners on **staging** before public launch.

## 1. Recruit (target: 10 businesses)

- Post in Dhaka/Bangladesh small-business and startup Facebook groups.
- Ideal profile: VAT-registered trading/services business, 5–50 invoices per
  month, currently using Excel or paper.
- Offer: free Business plan for 3 months + direct support line.

Message template:

> আমরা Hisab নামে একটি সহজ হিসাবরক্ষণ অ্যাপ তৈরি করেছি — ইনভয়েস, ভ্যাট রিপোর্ট
> (মুশক ৯.১), আর খরচ ট্র্যাকিং। ১০টি ব্যবসার জন্য ৩ মাস ফ্রি বেটা চালু করছি।
> আগ্রহী হলে কমেন্ট বা ইনবক্স করুন।

## 2. Onboard (live call per user)

Checklist per session (30 minutes, screen share):

- [ ] They sign up themselves (watch where they hesitate — do not steer)
- [ ] Company + BIN entered correctly on the wizard
- [ ] They create their first real invoice
- [ ] They open the VAT page and understand Output / Input / Net
- [ ] Note every point of confusion verbatim in a shared doc

## 3. Measure (PostHog)

The app emits this funnel — build it in PostHog → Insights → Funnel:

`signup → onboarding_complete → invoice_created → vat_viewed → upgrade_clicked`

Weekly review:

- Drop-off per step (biggest drop = next UX fix)
- Active users per week (target: 6 of 10 create a second invoice)

## 4. Triage (Sentry)

- Review new Sentry issues twice a week during beta.
- Fix the top 10 recurring errors before public launch (plan requirement).
- Tag beta-user-reported bugs `beta` and prioritise crashes > wrong numbers >
  cosmetics.

## 5. Exit criteria (from the production plan)

- [ ] 10 users signed up, at least 6 weekly-active
- [ ] Accountant sign-off recorded in `docs/vat-verification.md`
- [ ] Top 10 Sentry issues resolved
- [ ] Funnel conversion signup → invoice_created above 50%
