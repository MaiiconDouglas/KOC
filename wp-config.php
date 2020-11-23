<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'figelw65_koc2020' );

/** MySQL database username */
define( 'DB_USER', 'figelw65_koc2020' );

/** MySQL database password */
define( 'DB_PASSWORD', '7-190pS]xw' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'jjpdsdw44hf8ypamomrzvjws6yekzetqk1gveqhsxd8xskwppmaohwc2pxyz25yc' );
define( 'SECURE_AUTH_KEY',  'xfrrrtzejaitc8ukybje7tznyufxi46p6p0ehsn0q5fvmjsf3uw4dfcbqwot38gg' );
define( 'LOGGED_IN_KEY',    'c5lz83gfglo0vfumt0kgeahrs8at2pst8db89e2i2m2pley4qubwt8tnsrmqkkqd' );
define( 'NONCE_KEY',        'xx53litavjdhcgx4qztm0m1a9ee7hi9p2jmo53t3pohu7pjxz5gjfcso7olxvspn' );
define( 'AUTH_SALT',        '77m85bomt0lerhrmzpa5exvhknc3hv2myeplx0rmj1wlic9rzftjbwmn7sdv2ech' );
define( 'SECURE_AUTH_SALT', 'lmn14vyd280sw1bl7e7zptdecg3rx5hccagxwegsnr0kz69wg877imkuzosqvz1y' );
define( 'LOGGED_IN_SALT',   'ranx3aqbrodjnfjz2akihv9gne1cgcqcmu8jwgk2yuni0dgd7yqyibxvwkngrzcr' );
define( 'NONCE_SALT',       'jlagsqpcxnngrsi1lttumgazuoyckfeazrukssiut1rcj30geeouvdejaau4b1tu' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wptg_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
