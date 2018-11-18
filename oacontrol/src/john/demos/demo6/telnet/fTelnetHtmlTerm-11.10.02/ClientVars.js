var ClientVars = {};

// AlertDialogX and AlertDialogY control where the connect button will be displayed
// NOTE: To center the connect button, use 0 for both values
// NOTE: To position relative to the top or left, use positive values.  To position relative to the bottom or right, use negative values
// NOTE: To position based on percent instead of pixel count, use values between 0 and 1 (or 0 and -1) (0.50 = 50%, for example)
// Default: 0 
ClientVars.AlertDialogX = 0;
ClientVars.AlertDialogY = 0;

// AutoConnect controls how a connection to the remote server is initiated.  
//   0 = Disabled -- User must click a button to connect
//   1 = Enabled -- Connection is made after the page loads
// Default: 0
ClientVars.AutoConnect = 0;

// BitsPerSecond controls how fast data is received from the remote server 
// (except during file transfers, which run at full speed).
//   Here are some suggested values to try:
//     115200, 57600, 38400, 28800, 19200, 14400, 9600, 4800, 2400, 1200, 300
//   (Those were just common bitrates, feel free to use any value you want)
// Default: 115200
ClientVars.BitsPerSecond = 115200;

// BorderStyle controls how the border and close button looks.
//   "FlashTerm"  = Single pixel border, like FlashTerm, no close button
//   "None"       = No border, no close button
//   "Ubuntu1004" = Ubuntu 10.04 style
//   "Win2000"    = Windows 2000 style
//   "Win7"       = Windows 7 style
//   "WinXP"      = Windows XP style
// Default: Win7
ClientVars.BorderStyle = "Win7";

// CodePage controls which font file to use.
// NOTE: Each code page has its own set of supported FondWidth and FontHeight
//       values, so see the online documentation for help selecting OK values
//   Available IBM PC code pages: 
//     437 = The original IBM PC code page
//     737 = Greek
//     850 = Multilingual (Latin-1) (Western European languages)
//     852 = Slavic (Latin-2) (Central and Eastern European languages)
//     855 = Cyrillic
//     857 =  Turkish
//     860 = Portuguese
//     861 = Icelandic
//     862 = Hebrew
//     863 = French (Quebec French)
//     865 = Danish/Norwegian
//     866 = Cyrillic
//     869 = Greek
//   Available Amiga "code pages": 
//     BStrict
//     BStruct
//     MicroKnight
//     MoSoul
//     PotNoodle
//     Topaz
//     TopazPlus
//   Available Atari "code pages" for standard 40 column displays:
//     ATASCII-Arabic
//     ATASCII-Graphics (Default for Atari)
//     ATASCII-International
//   Available Atari "code pages" for non-standard 80 column displays:
//     ATASCII-Arabic-HalfWidth
//     ATASCII-Graphics-HalfWidth
//     ATASCII-International-HalfWidth
// Default: 437
ClientVars.CodePage = "437"; 

// ConnectAnsi controls which ANSI file to display under the initial Connect button
// NOTE: This setting has no effect when ClientVars.RIP is set to 1
// NOTE: This should be the full absolute path, so if the .ans file is at
// http://www.ftelnet.ca/mybbs/connect.ans then the absolute path would be "/mybbs/connect.ans"
// Default: "/connect.ans"
ClientVars.ConnectAnsi = "/connect.ans";

// ConnectButtonX and ConnectButtonY control where the connect button will be displayed
// NOTE: To center the connect button, use 0 for both values
// NOTE: To position relative to the top or left, use positive values.  To position relative to the bottom or right, use negative values
// NOTE: To position based on percent instead of pixel count, use values between 0 and 1 (or 0 and -1) (0.50 = 50%, for example)
// Default (ANSI): -0.08, 0.30
// Default (RIP): -10, 90
ClientVars.ConnectButtonX = -0.08;
ClientVars.ConnectButtonY = 0.30;

// ConnectRIP controls which RIP file to display under the initial Connect button
// NOTE: This setting has no effect unless ClientVars.RIP is set to 1
// Default: connect.rip
ClientVars.ConnectRIP = "/connect.rip";

// Enter controls what to send to the server when the Enter key is pressed.  
//   The telnet specification says to send \r\n (ASCII CRLF) when the Enter key
//   is pressed, but not all software will work with that, so you may have more
//   luck with the non-standard \r (ASCII CR without the LF). 
// Default: \r
ClientVars.Enter = "\r";

// FontHeight and FontWidth control the size of each character on screen.  
// NOTE: These values only need to be set if you're using an IBM PC code page.
//       The Amiga and Atari code pages will override these values, as there
//       is only one available font size for those "code pages".
//   Available IBM PC code page sizes: 
//     437 = 8x12, 8x13, 9x16, 10x19, 12x23
//     737 =             9x16,        12x23
//     850 =       8x13, 9x16, 10x19, 12x23
//     852 =             9x16, 10x19, 12x23
//     855 =             9x16                 
//     857 =             9x16              
//     860 =             9x16              
//     861 =             9x16              
//     862 =                   10x19         
//     863 =             9x16                 
//     865 =       8x13, 9x16, 10x19, 12x23
//     866 =             9x16                 
//     869 =             9x16              
// Default: 9x16
ClientVars.FontWidth = 9;
ClientVars.FontHeight = 16;

// Proxy settings allow fTelnet and HtmlTerm to connect to ANY telnet server,
// regardless of whether they have the proper flash socket policy server
// installed, or if the understand the WebSocket protocol.
// NOTE: Telnet servers must first be authorized, since I can't have you
//       proxying to just any remote server (for example, I don't want my
//       proxy being used to abuse cia.gov or something!)
// For more information on using the proxy, please see the online documentation.
// These settings are commented out by default, which disables proxy use.
// ClientVars.ProxyRLoginHostName = "proxy.ftelnet.ca";
// ClientVars.ProxyRLoginPort = 51313;
// ClientVars.ProxySocketPolicyPort = 843;
// ClientVars.ProxyTelnetHostName = "proxy.ftelnet.ca";
// ClientVars.ProxyTelnetPort = 2323;
// ClientVars.ProxyWebSocketHostName = "proxy.ftelnet.ca";
// ClientVars.ProxyWebSocketPort = 11235;

// RIP controls whether the client will display RIPscrip or ANSI
// Default: 0
ClientVars.RIP = 0;

// RIPIconPath controls where .ICN files are loaded from.  
// Flash requires the icons to be on the same domain that fTelnet.swf is being loaded from, so
// you don't need to include that here, just the path. 
// For example, if the icons are in http://www.ftelnet.ca/mybbs/ripicons/*.ICN
// then the absolute path to the icons entered below would be "/mybbs/ripicons/"
// Default: "/ripicon"
ClientVars.RIPIconPath = "/ripicon";

// RLogin* controls whether RLogin is used to connect to the remote server (instead of Telnet)
ClientVars.RLogin = 0;
ClientVars.RLoginHostName = "bbs.ftelnet.ca";
ClientVars.RLoginPort = 513;
ClientVars.RLoginClientUserName = "";
ClientVars.RLoginServerUserName = "";
ClientVars.RLoginTerminalType = "";

// ScreenColumns and ScreenRows control the size of the screen.  
//   Anything within reason should be accepted 
//   (no sanity checking is done, so bad values can/will crash the program)
// Default: 80x24 
ClientVars.ScreenColumns = 80;
ClientVars.ScreenRows = 25;

// SendOnConnect controls what text will be sent to the server immediately 
// after connecting.  Useful for auto-login purposes.  
// Default: empty
ClientVars.SendOnConnect = "";

// ServerName is the display name for the server
ClientVars.ServerName = "fTelnet and HtmlTerm Support BBS";

// SocketPolicyPort is the port that your flash socket policy server is 
// running on the remote server (required by flash, wish I could disable it!)
// For more information on setting up a flash socket policy server, please see 
// the online documentation.
// Default: 843
ClientVars.SocketPolicyPort = 843;

// TelnetHostName is the host name or IP address of the remote telnet server
// NOTE: fTelnet specific setting
ClientVars.TelnetHostName = "bbs.ftelnet.ca";

// TelnetPort is the port number to connect to on the remote telnet server
// NOTE: fTelnet specific setting
// Default: 23
ClientVars.TelnetPort = 23;

// VT controls whether fTelnet should try to be more like a VTxxx series terminal,
// rather than like a BBS terminal client
// Default: 0
ClientVars.VT = 0;

// WebSocketHostName is the host name or IP address of the remote websocket server
// NOTE: HtmlTerm specific setting
ClientVars.WebSocketHostName = "bbs.ftelnet.ca";

// WebSocketPort is the port number to connect to on the remote websocket server
// NOTE: HtmlTerm specific setting
// Default: 1123
ClientVars.WebSocketPort = 1123;