import { test, expect } from "@playwright/test"

// Define base URL for convenience
const BASE_URL = "http://localhost:3000"

test.describe("Authentication Flow", () => {
  // Test: Unauthenticated user should be redirected to the login page
  test("should redirect unauthenticated user to login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    // Expect to be redirected to the login page (which is '/')
    await expect(page).toHaveURL(`${BASE_URL}/`)
    await expect(page.locator("h1")).toContainText("Gestion Immobilière CI")
  })

  // Test: Successful login and access to dashboard
  test("should allow user to log in and access dashboard", async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Fill in login credentials
    await page.fill('input[id="username"]', "agent")
    await page.fill('input[id="password"]', "immobilier2024")

    // Click the login button
    await page.click('button[type="submit"]')

    // Wait for navigation to the dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // Expect to be on the dashboard page
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    await expect(page.locator("h2")).toContainText("Tableau de Bord Principal")
    await expect(page.locator("text=Bienvenue, agent")).toBeVisible()
  })

  // Test: Invalid credentials should show an error
  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/`)

    // Fill in incorrect login credentials
    await page.fill('input[id="username"]', "wronguser")
    await page.fill('input[id="password"]', "wrongpassword")

    // Click the login button
    await page.click('button[type="submit"]')

    // Expect to stay on the login page and see an error toast
    await expect(page).toHaveURL(`${BASE_URL}/`)
    await expect(page.locator('div[data-sonner-toast][data-type="error"]')).toContainText(
      "Nom d'utilisateur ou mot de passe incorrect.",
    )
  })

  // Test: User should be able to log out
  test("should allow user to log out", async ({ page }) => {
    // First, log in the user
    await page.goto(`${BASE_URL}/`)
    await page.fill('input[id="username"]', "agent")
    await page.fill('input[id="password"]', "immobilier2024")
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // Click the logout button
    await page.click('button:has-text("Déconnexion")')

    // Expect to be redirected back to the login page
    await page.waitForURL(`${BASE_URL}/`)
    await expect(page).toHaveURL(`${BASE_URL}/`)
    await expect(page.locator("h1")).toContainText("Gestion Immobilière CI")
  })

  // Test: Authenticated user should be able to access protected terrain page
  test("should allow authenticated user to access terrains page", async ({ page }) => {
    // Log in first
    await page.goto(`${BASE_URL}/`)
    await page.fill('input[id="username"]', "agent")
    await page.fill('input[id="password"]', "immobilier2024")
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // Navigate to the terrains page
    await page.goto(`${BASE_URL}/terrains`)

    // Expect to be on the terrains page
    await expect(page).toHaveURL(`${BASE_URL}/terrains`)
    await expect(page.locator("h1")).toContainText("Gestion des Terrains")
  })
})
