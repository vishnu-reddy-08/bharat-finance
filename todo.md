# Bharat Finance Mitra - Development TODO

## Core Features

### Dashboard & Navigation
- [x] Sidebar navigation with 5 sections: Dashboard, Expenses, Tax Engine, Nudges, AI Coach
- [x] DashboardLayout component integration
- [x] User authentication and profile display

### Dashboard Page
- [x] Financial Health Score calculation (0-100 based on savings rate)
- [x] Total Balance display with Indian ₹ formatting
- [x] Monthly Income display
- [x] Safe-to-Spend daily limit calculation and display
- [x] Visual indicators and charts for financial overview

### Expense Analysis (UPI-First)
- [x] Transaction import interface
- [x] Support for Indian bank SMS formats
- [x] Support for UPI alert formats
- [x] LLM-powered auto-categorization (Needs, Wants, Investments)
- [x] Transaction history display
- [x] Category breakdown visualization

### Savings Nudges & Feed
- [x] Nudge feed/sidebar component
- [x] AI-generated nudges for savings goal proximity
- [x] Liquid Fund suggestions with interest calculations
- [x] Festive Spending alerts (Diwali and Wedding season)
- [x] Nudge history persistence

### Tax Engine Tool (2025-26)
- [x] Income analysis interface
- [x] New vs Old Tax Regime comparison
- [x] Standard deduction calculations
- [x] NPS benefits under Section 80CCD(2)
- [x] Tax recommendation engine
- [x] Savings projection display

### Interactive AI Coach
- [x] Bottom-anchored chat drawer component
- [x] Natural language query processing
- [x] Spending history Q&A
- [x] Financial planning advice
- [x] Chat history persistence
- [x] LLM integration for responses

### Data & Compliance
- [x] DPDP Act 2023 consent toggles (granular)
- [x] Consent toggles on all data collection screens
- [x] Friction-as-a-Feature: 1-second confirmation delay for high-stakes actions
- [x] Visual feedback for confirmation delays
- [x] Savings goal change protection

### Database & Persistence
- [x] Drizzle ORM schema for transactions
- [x] Financial profile storage
- [x] Savings goals table
- [x] Nudge history table
- [x] Consent preferences table
- [x] Chat history table

### Styling & UX
- [x] Trust Blue (#3361FF) primary color palette
- [x] High-contrast neutral backgrounds
- [x] Legibility-first design
- [x] Indian currency formatting (₹, Lakhs, Crores)
- [x] Mobile-responsive design
- [x] Tailwind CSS 4 + Shadcn UI components

## Technical Implementation

- [x] Database schema setup with Drizzle ORM
- [x] tRPC procedures for all backend operations
- [x] LLM integration for transaction categorization
- [x] LLM integration for AI Coach responses
- [x] Nudge generation engine
- [x] Tax calculation engine
- [x] Indian number formatting utilities
- [ ] Vitest unit tests for core logic
- [x] Error handling and validation

## Deployment & Delivery

- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility check
- [ ] Final build verification
- [ ] GitHub repository setup and push
- [ ] Project checkpoint creation
