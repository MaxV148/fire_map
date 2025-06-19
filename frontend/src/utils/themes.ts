export const lightTheme = {
    token: {
        // Seed Token - Hauptfarben
        colorPrimary: '#E63946',              // Primärfarbe: Kräftiges Feuerrot
        colorSuccess: '#F4A261',              // Sekundärfarbe: Orange/Apricot für Erfolg
        colorInfo: '#457B9D',                 // Highlightfarbe: Mittelblau für Info
        colorWarning: '#F4A261',              // Orange/Apricot für Warnungen
        colorError: '#E63946',                // Feuerrot für Fehler
        
        // Textfarben
        colorText: '#2B2D42',                 // Text dunkel: Fast schwarz
        colorTextSecondary: '#457B9D',        // Sekundärer Text: Mittelblau
        colorTextTertiary: '#1D3557',         // Tertiärer Text: Dunkelblau
        colorTextQuaternary: '#F1FAEE',       // Heller Text für dunkle Hintergründe
        
        // Hintergrundfarben
        colorBgContainer: '#FAFAFA',          // Haupthintergrund: Sehr helles Grau
        colorBgElevated: '#ECECEC',           // Sekundärer Hintergrund: Für Karten
        colorBgLayout: '#FAFAFA',             // Layout-Hintergrund
        colorBgSpotlight: '#ECECEC',          // Spotlight-Hintergrund
        
        // Border und andere UI-Elemente
        colorBorder: '#ECECEC',               // Standard Border
        colorBorderSecondary: '#1D3557',      // Sekundäre Border: Dunkelblau
        
        // Spezielle Farbanpassungen
        controlOutline: 'rgba(70, 123, 157, 0.1)', // Outline-Farbe mit Mittelblau
        
        // Layout-Einstellungen
        borderRadius: 8,                      // Abgerundete Ecken
        wireframe: false,                     // Modernes Design
    },
    components: {
        // Button-spezifische Anpassungen
        Button: {
            colorPrimary: '#E63946',
            algorithm: true,
            borderRadius: 6,
        },
        // Input-spezifische Anpassungen
        Input: {
            colorBorder: '#ECECEC',
            borderRadius: 6,
            algorithm: true,
        },
        // Layout-spezifische Anpassungen
        Layout: {
            colorBgBody: '#FAFAFA',
            colorBgContainer: '#FAFAFA',
            algorithm: true,
        },
        // Card-spezifische Anpassungen
        Card: {
            colorBgContainer: '#ECECEC',
            borderRadius: 12,
            algorithm: true,
        },
        // Menu-spezifische Anpassungen
        Menu: {
            colorItemBg: '#FAFAFA',
            colorItemBgSelected: '#ECECEC',
            colorItemTextSelected: '#1D3557',
            algorithm: true,
        },
    },
};

export const darkTheme = {
    token: {
        // Seed Token - Hauptfarben (gleich wie Light)
        colorPrimary: '#E63946',              // Primärfarbe: Kräftiges Feuerrot
        colorSuccess: '#F4A261',              // Sekundärfarbe: Orange/Apricot für Erfolg
        colorInfo: '#457B9D',                 // Highlightfarbe: Mittelblau für Info
        colorWarning: '#F4A261',              // Orange/Apricot für Warnungen
        colorError: '#E63946',                // Feuerrot für Fehler
        
        // Textfarben (invertiert für Dark Mode)
        colorText: '#F1FAEE',                 // Heller Text für dunkle Hintergründe
        colorTextSecondary: '#457B9D',        // Sekundärer Text: Mittelblau (bleibt gleich)
        colorTextTertiary: '#F4A261',         // Tertiärer Text: Orange/Apricot
        colorTextQuaternary: '#2B2D42',       // Dunkler Text für helle Elemente
        
        // Hintergrundfarben (dunkel)
        colorBgContainer: '#1D3557',          // Haupthintergrund: Dunkelblau
        colorBgElevated: '#2B2D42',           // Sekundärer Hintergrund: Fast schwarz
        colorBgLayout: '#1D3557',             // Layout-Hintergrund
        colorBgSpotlight: '#2B2D42',          // Spotlight-Hintergrund
        
        // Border und andere UI-Elemente
        colorBorder: '#457B9D',               // Standard Border: Mittelblau
        colorBorderSecondary: '#F4A261',      // Sekundäre Border: Orange/Apricot
        
        // Spezielle Farbanpassungen
        controlOutline: 'rgba(244, 162, 97, 0.2)', // Outline-Farbe mit Orange
        
        // Layout-Einstellungen
        borderRadius: 8,                      // Abgerundete Ecken
        wireframe: false,                     // Modernes Design
    },
    components: {
        // Button-spezifische Anpassungen
        Button: {
            colorPrimary: '#E63946',
            algorithm: true,
            borderRadius: 6,
        },
        // Input-spezifische Anpassungen
        Input: {
            colorBorder: '#457B9D',
            borderRadius: 6,
            algorithm: true,
        },
        // Layout-spezifische Anpassungen
        Layout: {
            colorBgBody: '#1D3557',
            colorBgContainer: '#1D3557',
            algorithm: true,
        },
        // Card-spezifische Anpassungen
        Card: {
            colorBgContainer: '#2B2D42',
            borderRadius: 12,
            algorithm: true,
        },
        // Menu-spezifische Anpassungen
        Menu: {
            colorItemBg: '#1D3557',
            colorItemBgSelected: '#2B2D42',
            colorItemTextSelected: '#F1FAEE',
            algorithm: true,
        },
    },
}; 