use tauri::{
    menu::{Menu, MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

use crate::commands::AppState;

/// Creates and initializes the system tray icon with menu
pub fn create_tray(app: &AppHandle) -> Result<(), String> {
    // Build the tray menu
    let menu = build_tray_menu(app)?;

    // Register menu event handler on the app
    app.on_menu_event(move |app, event| match event.id().as_ref() {
        "show_hide" => handle_show_hide(app),
        "translate" => handle_translate(app),
        "settings" => handle_settings(app),
        "quit" => handle_quit(app),
        _ => {}
    });

    // Create the tray icon
    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("Japanese-English Translator (Cmd+J)")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false) // Don't show menu on left click
        .on_tray_icon_event({
            let app_handle = app.clone();
            move |_tray, event| {
                // Left click: Toggle window visibility
                if let TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
                    println!("[DEBUG] Tray icon left-clicked - toggling window");
                    handle_show_hide(&app_handle);
                }
                // Right click: Menu shows automatically (handled by Tauri)
            }
        })
        .build(app)
        .map_err(|e| format!("Failed to create tray icon: {}", e))?;

    println!("✓ System tray icon created successfully");
    Ok(())
}

/// Builds the tray menu with all items and separators
fn build_tray_menu(app: &AppHandle) -> Result<Menu<tauri::Wry>, String> {
    // Create menu items
    let show_hide = MenuItemBuilder::with_id("show_hide", "Show/Hide Window")
        .build(app)
        .map_err(|e| format!("Failed to create show/hide item: {}", e))?;

    let translate = MenuItemBuilder::with_id("translate", "Translate Selection (Cmd+J)")
        .build(app)
        .map_err(|e| format!("Failed to create translate item: {}", e))?;

    let settings = MenuItemBuilder::with_id("settings", "Settings...")
        .build(app)
        .map_err(|e| format!("Failed to create settings item: {}", e))?;

    let quit = MenuItemBuilder::with_id("quit", "Quit")
        .build(app)
        .map_err(|e| format!("Failed to create quit item: {}", e))?;

    // Build menu with separators
    let menu = MenuBuilder::new(app)
        .item(&show_hide)
        .item(&translate)
        .separator()
        .item(&settings)
        .separator()
        .item(&quit)
        .build()
        .map_err(|e| format!("Failed to build menu: {}", e))?;

    Ok(menu)
}

/// Toggles main window visibility
fn handle_show_hide(app: &AppHandle) {
    let result: Result<(), String> = (|| {
        let window = app
            .get_webview_window("main")
            .ok_or("Main window not found")?;

        let is_visible = window
            .is_visible()
            .map_err(|e| format!("Failed to check visibility: {}", e))?;

        if is_visible {
            println!("[DEBUG] Hiding main window");
            window
                .hide()
                .map_err(|e| format!("Failed to hide window: {}", e))?;
        } else {
            println!("[DEBUG] Showing main window");
            window
                .show()
                .map_err(|e| format!("Failed to show window: {}", e))?;
            window
                .set_focus()
                .map_err(|e| format!("Failed to focus window: {}", e))?;
        }

        Ok(())
    })();

    if let Err(e) = result {
        eprintln!("❌ Show/Hide error: {}", e);
    }
}

/// Triggers the translation workflow (same as Cmd+J)
fn handle_translate(app: &AppHandle) {
    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        println!("[DEBUG] Tray menu: Triggering translation");

        // Access state and call translate_selection command
        let app_clone2 = app_clone.clone();
        let state_guard = app_clone.state::<AppState>();
        let result = crate::commands::translate_selection(app_clone2, state_guard).await;

        if let Err(e) = result {
            eprintln!("❌ Translation error from tray: {}", e);
        }
    });
}

/// Shows settings dialog (placeholder for future implementation)
fn handle_settings(_app: &AppHandle) {
    println!("[DEBUG] Tray menu: Settings clicked");

    // TODO: Replace with proper dialog when Tauri 2 dialog API is stable
    // For now, just log the action
    eprintln!("Settings panel coming soon!");
    eprintln!("You'll be able to configure:");
    eprintln!("• API key");
    eprintln!("• Hotkey customization");
    eprintln!("• Translation preferences");
}

/// Exits the application
fn handle_quit(app: &AppHandle) {
    println!("[DEBUG] Tray menu: Quit clicked");
    app.exit(0);
}
