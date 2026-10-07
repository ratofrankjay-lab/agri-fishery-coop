# AI Prompt Log

## Entry 1 — Requirements Analysis and Initial Project Setup

### Prompt
Requirements analysis request and "start with Git setup and HTML skeleton"

### AI Suggested
The AI suggested the initial project structure and HTML skeleton for the **Agri-Fishery Cooperative Order and Inventory System**, including:

- `index.html`
- `css/style.css`
- `js/app.js`
- `README.md`
- `docs/requirements-analysis.md`
- `docs/ai-prompt-log.md`
- `docs/screenshots/`

The HTML skeleton included placeholder sections for:
1. Products
2. Orders
3. Order Details
4. Reports

The AI also recommended using HTML, CSS, Vanilla JavaScript, and localStorage, without frameworks, a server, or a database.

### What I Tested
- The page opens successfully in the browser.
- The Products, Orders, Order Details, and Reports sections appear.
- The required form fields and basic interface elements appear.
- The page loads without a major browser error.

### What Was Wrong
- All four sections are visible at the same time because the JavaScript navigation and section-hiding functionality have not been implemented yet.
- The application is only an initial HTML skeleton at this stage.
- Product management, order processing, stock management, validation, reports, and localStorage functionality are not implemented yet.

### What I Changed
- No major changes were made to the AI-generated initial skeleton.
- I reviewed the generated structure and verified that the required files and sections were present.
- Further functionality will be implemented and tested in the next development stages. ## Entry 2 — CSS Styling and Section Visibility
  
  Entry 2
### Prompt
"Yes, then proceed to step 2."

This confirmed that the application should proceed with the next development step after confirming the following decisions:
- The system should re-check available stock when an order is Confirmed.
- Orders should only have their details changed while they are Pending; after confirmation, the order should be controlled through valid status changes.

### AI Suggested
The AI suggested the CSS for the initial application interface, including styling for:

- Page layout and spacing
- Navigation
- Forms and input fields
- Buttons
- Tables
- Success and error message classes
- Low-stock indicators
- Hidden application sections
- The `#message` notification area

### What I Tested
I tested the following:

1. The overall page appearance and layout in the browser.
2. Spacing between the navigation, sections, forms, and tables.
3. The message classes through the browser Console to verify that the success and error message styling can be applied.
4. The `hidden` sections to verify that sections marked with the `hidden` class do not appear on the page.
5. The application still loads successfully after adding the CSS.

### What Was Wrong / Changed
- Some spacing and layout areas were adjusted where the interface looked too crowded.
- The hidden-section styling was checked to ensure that sections intended to be hidden were not displayed.
- The message area was checked so that an empty message container does not leave an unnecessary blank box in the interface.
- The CSS was kept simple and organized so it remains easy to explain and modify during the exam.
- No unnecessary framework or external CSS library was added.

### Technical Explanation

#### `[hidden] { display: none !important; }`

The `[hidden]` selector targets HTML elements that have the `hidden` attribute.

For example:

```html
<section id="orders" hidden>
```

Normally, the browser already hides an element with the `hidden` attribute. The CSS rule makes the behavior explicit:

```css
[hidden] {
    display: none !important;
}
```

`display: none` means the element is removed from the visible page layout.

The `!important` helps ensure that another CSS rule does not accidentally override the hiding behavior.

In this application, this is useful because JavaScript can control which section is currently visible by adding or removing the `hidden` attribute.

#### `#message:empty`

The `:empty` pseudo-class selects an element that has no content.

For example:

```html
<div id="message"></div>
```

If the message container is empty, this CSS rule can hide it:

```css
#message:empty {
    display: none;
}
```

This prevents an empty message container from appearing as a blank box when there is no success or error message.

When JavaScript places a message inside it, such as:

```javascript
message.textContent = "Product added successfully.";
```

the element is no longer empty, so the message becomes visible.

### Student Understanding
I understand that the CSS controls the visual presentation of the application, while JavaScript will later control the navigation, data processing, validation, and dynamic messages.

//Entry 3//### Step 3

- **Prompt:** "lets proceed onto step 3"
- **AI suggested:** Storage helper functions for saving and loading data, an order counter for generating order numbers, `showMessage()` for displaying user feedback, and `showView()` for switching between different application views.
- **What I tested:** I tested the view-switching functionality, displayed success/error messages, checked whether data persisted after refreshing the page, and tested the system's behavior when stored data was damaged or invalid.
- **What was wrong / changed:** The initial implementation required testing to ensure that view switching and message displays worked correctly. I also checked local storage persistence and verified how the application handled damaged stored data. Minor adjustments were made to the storage handling and interface behavior to prevent invalid data from causing errors and to ensure the application continued functioning properly.