# GiftLink submission evidence checklist

Capture the following from the real GitHub repository, MongoDB instance, browser session, or Actions run. No screenshots or live deployment are included yet.

- [ ] `01-public-repository-and-template.png` — public GitHub repository and user-story issue template.
- [ ] `02-eight-labeled-user-stories.png` — all eight user-story issues with recognized labels.
- [ ] `03-mongodb-16-gifts.png` — MongoDB `giftdb.gifts` collection showing the verified 16 starter documents.
- [ ] `13-live-homepage.png` — deployed home page with its actual URL visible.
- [ ] `14-public-gift-list.png` — gift list before login with its actual URL visible.
- [ ] `15-registration-before-submit.png` — completed registration form before submission; do not expose a real password.
- [ ] `16-signed-in-navbar.png` — navbar showing the signed-in user's name and actual URL.
- [ ] `17-gift-details.png` — a real gift details page and actual URL.
- [ ] `18-search-results-and-ci.png` — matching search results and the successful GitHub Actions workflow; include actual URLs.

The GitHub issues and template were confirmed online. The local MongoDB service is running in Docker, and `giftdb.gifts` was verified to contain 16 documents with unique IDs; the MongoDB evidence image still needs to be captured. No production hosting is configured, so the application screenshots must be captured after a real deployment. No GitHub Actions run exists yet; capture the successful workflow after the changes have been pushed and CI has completed.
