<?php

/**
 * Plugin Name: SM Dental Insurance
 * Description: A plugin to provide dental insurance quotes and options.
 * Author: Your Name
 * Version: 1.0.0
 *
 * @package           SM Dental Insurance
 * @author            Your Name
 * @copyright         2024 Your Name
 */

defined('ABSPATH') || exit;

define('SM_DENTAL_INSURANCE_DIR', plugin_dir_path(__FILE__));
define('SM_DENTAL_INSURANCE_ASSETS_DIR', trailingslashit(plugins_url('/sm-dental-insurance/', SM_DENTAL_INSURANCE_DIR) . 'assets'));
define('SM_DENTAL_INSURANCE_SHORTCODES_DIR', trailingslashit(SM_DENTAL_INSURANCE_DIR . 'shortcodes'));
define('SM_DENTAL_INSURANCE_DATA_URL', trailingslashit(SM_DENTAL_INSURANCE_ASSETS_DIR . 'data'));

// 插件激活时的操作
function sm_dental_insurance_activation() {
    global $wpdb;
    $table_name = $wpdb->prefix . "sm_dental";
    $sql = "CREATE TABLE " . $table_name . " (
                    `id` bigint(20) NOT NULL AUTO_INCREMENT,
                    `zip` varchar(128) CHARACTER SET utf8 NULL DEFAULT NULL,
                    `service` varchar(128) CHARACTER SET utf8 NULL DEFAULT NULL,
                    `phone` varchar(128) CHARACTER SET utf8 NULL DEFAULT NULL,
                    `created_date` datetime NULL DEFAULT NULL,
                    PRIMARY KEY (`id`)
                ) ENGINE=MyISAM  DEFAULT CHARSET=utf8;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// 插件停用时的操作
function sm_dental_insurance_deactivation() {

}

class SM_Dental_Insurance {
    private static $instance = null;

    public static function getInstance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->init();
    }

    public function init() {
        // 导入前端资源
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts_and_styles'));
        // 短码
        add_shortcode('sm-dental-form', array($this, 'dental_form_shortcode'));
    }

    public function enqueue_scripts_and_styles() {
        wp_enqueue_style('flatpickr-material-red-style', 'https://npmcdn.com/flatpickr/dist/themes/material_red.css', array(), null);
        wp_enqueue_style('sm-dental-insurance-style', SM_DENTAL_INSURANCE_ASSETS_DIR . 'css/style.css', array('flatpickr-material-red-style'), '1.0.0');
        wp_enqueue_style('sm-flatpickr-style', SM_DENTAL_INSURANCE_ASSETS_DIR . 'css/flatpickr_customize.css', array(), '1.0.0');

        wp_enqueue_script('sm-flatpickr', 'https://cdn.jsdelivr.net/npm/flatpickr', array(), '1.0.0', true);
        wp_enqueue_script('sm-flatpickr-year-plugin', SM_DENTAL_INSURANCE_ASSETS_DIR . 'js/year_flatpickr_plugin.js', array('sm-flatpickr'), '1.0.0', true);
        wp_enqueue_script('vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js', array(), '2.6.12', true);

        wp_enqueue_script('sm-dental-insurance-script', SM_DENTAL_INSURANCE_ASSETS_DIR . 'js/script.js', array('vuejs', 'sm-flatpickr-year-plugin', 'sm-flatpickr'), '1.0.0', true);
    }

    // 短码实现
    public function dental_form_shortcode() {
        ob_start();
        include(SM_DENTAL_INSURANCE_SHORTCODES_DIR . 'dental-form.php');
        return ob_get_clean();
    }
}

function sm_dental_insurance_init() {
    return SM_Dental_Insurance::getInstance();
}

register_activation_hook(__FILE__, 'sm_dental_insurance_activation');
register_deactivation_hook(__FILE__, 'sm_dental_insurance_deactivation');
add_action('plugins_loaded', 'sm_dental_insurance_init');