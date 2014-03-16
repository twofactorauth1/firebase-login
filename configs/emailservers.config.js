module.exports = {
    SMTP: {
        port: 25,
        sslPort: 465,
        tlsPort: 587
    },

    IMAP: {
        port: 143,
        tlsPort: 143,
        sslPort:993
    },

    GMAIL: {
        label: "Gmail",
        data: "gmail",

        SMTP: {
            server: "smtp.gmail.com",
            sslPort: 465,
            tlsPort: 587
        },

        IMAP: {
            server: "imap.gmail.com",
            sslPort: 993
        }
    },

    OUTLOOK: {
        label: "Outlook.com (Hotmail)",
        data: "outlook",

        SMTP: {
            server: "smtp-mail.outlook.com",
            tlsPort: 587
        },

        IMAP: {
            server: "imap-mail.outlook.com",
            sslPort: 993
        }
    },

    AOL: {
        label: "AOL",
        data: "aol",

        SMTP: {
            server: "smtp.aol.com",
            tlsPort: 587,
            sslPort: 465
        },

        IMAP: {
            server: "imap.aol.com",
            sslPort: 993
        }
    },

    YAHOO: {
        label: "Yahoo",
        data: "yahoo",

        SMTP: {
            server: "smtp.mail.yahoo.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.mail.yahoo.com",
            sslPort: 993
        }
    },

    YAHOO_PLUS: {
        label: "Yahoo Mail Plus",
        data: "yahoo_plus",

        SMTP: {
            server: "plus.smtp.mail.yahoo.com",
            sslPort: 465
        },

        IMAP: {
            server: "plus.imap.mail.yahoo.com",
            sslPort: 993
        }
    },

    YAHOO_UK: {
        label: "Yahoo Mail UK",
        data: "yahoo_uk",

        SMTP: {
            server: "smtp.mail.yahoo.co.uk",
            sslPort: 465
        },

        IMAP: {
            server: "imap.mail.yahoo.co.uk",
            sslPort: 993
        }
    },

    YAHOO_DEUTSCHLAND: {
        label: "Yahoo Mail Deutschland",
        data: "yahoo_ds",

        SMTP: {
            server: "smtp.mail.yahoo.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.mail.yahoo.com",
            sslPort: 993
        }
    },

    YAHOO_AU: {
        label: "Yahoo Mail AU/NZ",
        data: "yahoo_au_nz",

        SMTP: {
            server: "smtp.mail.yahoo.au",
            sslPort: 465
        },

        IMAP: {
            server: "imap.mail.yahoo.au",
            sslPort: 993
        }
    },

    ATT: {
        label: "AT&T",
        data: "att",

        SMTP: {
            server: "smtp.att.yahoo.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.att.yahoo.au",
            sslPort: 993
        }
    },

    NTL: {
        label: "NTLWorld.com",
        data:"ntl",

        SMTP: {
            server: "smtp.ntlworld.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.ntlworld.com",
            sslPort: 993
        }
    },

    BT: {
        label: "BT Connect",
        data:"bt",

        SMTP: {
            server: "smtp.btconnect.com",
            port: 25
        },

        IMAP: {
            server: "imap4.btconnect.com",
            port: 143
        }
    },

    O2_DEUTSCHLAND: {
        label: "O2 Deutschland",
        data:"o2_ds",

        SMTP: {
            server: "mail.o2online.de",
            port: 25
        },

        IMAP: {
            server: "imap.o2online.de",
            port: 143
        }
    },

    VERIZON: {
        label: "Verizon",
        data:"verizon",

        SMTP: {
            server: "outgoing.verizon.net",
            tlsPort: 587
        },

        IMAP: {
            server: "incoming.verizon.net",
            port: 143
        }
    },

    ZOHO: {
        label: "ZOHO Mail",
        data: "zoho",

        SMTP: {
            server: "smtp.zoho.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.zoho.com",
            sslPort: 993
        }
    },

    MAIL: {
        label: "Mail.com",
        data: "mailcom",

        SMTP: {
            server: "smtp.mail.com",
            sslPort: 465
        },

        IMAP: {
            server: "imap.mail.com",
            sslPort: 993
        }
    },


    _dp: null,
    dp: function() {
        if (this._dp != null) {
            return this._dp;
        }
        this._dp = [
            this.AOL,
            this.ATT,
            this.BT,
            this.GMAIL,
            this.MAIL,
            this.NTL,
            this.OUTLOOK,
            this.O2_DEUTSCHLAND,
            this.VERIZON,
            this.YAHOO,
            this.YAHOO_PLUS,
            this.YAHOO_UK,
            this.YAHOO_DEUTSCHLAND,
            this.YAHOO_AU,
            this.ZOHO,
        ];

        return this._dp;
    },


    getByEmailType: function(emailType) {
        return _.findWhere(this.dp(), {data:emailType});
    },

    getIMAPServer: function(emailType) {
        var source = this.getByEmailType(emailType);

        if (source == null) {
            return null;
        }
        return source.IMAP.server;
    },

    getIMAPPort: function(emailType, secure) {
        var source = this.getByEmailType(emailType);

        if (source == null) {
            return null;
        }

        source = source.IMAP;
        if (secure === true) {
            if (source.sslPort != null) {
                return source.sslPort;
            } else if(source.tlsPort != null) {
                return source.tlsPort;
            }
        } else if(secure === false) {
            if (source.port != null) {
                return source.port;
            }
        }

        if (source.sslPort != null) {
            return source.sslPort;
        } else if(source.tlsPort != null) {
            return source.tlsPort;
        } else if(source.port != null) {
            return source.port;
        }
        return null;
    }


}
