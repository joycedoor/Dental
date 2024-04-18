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
    public $lang = 'en';

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
        wp_enqueue_style('sm-dental-insurance-style', SM_DENTAL_INSURANCE_ASSETS_DIR . 'css/style.css', array(), '1.0.0');

        wp_enqueue_script('pikaday-js', 'https://cdn.jsdelivr.net/npm/pikaday/pikaday.js');
        wp_enqueue_style('pikaday-css', 'https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css');
        wp_enqueue_script('vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js', array(), '2.6.12', true);

        wp_enqueue_script('sm-dental-insurance-script', SM_DENTAL_INSURANCE_ASSETS_DIR . 'js/script.js', array('vuejs'), '1.0.0', true);
        wp_localize_script('sm-dental-insurance-script', 'smDentalData', array(
            'lang' => $this->lang
        ));
    }

    // 短码实现
    public function dental_form_shortcode($atts) {
        ob_start();
        $atts = shortcode_atts(array(
            'lang' => 'auto', // 默认自动检测
        ), $atts, 'sm-cep-form');

        // 如果设置了语言参数，则使用参数指定的语言，否则从浏览器获取
        if ($atts['lang'] !== 'auto') {
            $lang = $atts['lang'] === 'zh' ? 'cn' : 'en';
        } else {
            $browserLanguages = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
            $languageList = explode(',', $browserLanguages);
            $userPreferredLanguage = strtolower(substr($languageList[0], 0, 2));
            $lang = $userPreferredLanguage === 'zh' ? 'cn' : 'en';
        }

        $this->lang = $lang;
        if ($lang === 'cn') {
            include(SM_DENTAL_INSURANCE_SHORTCODES_DIR . 'dental-form-cn.php');
        } else {
            include(SM_DENTAL_INSURANCE_SHORTCODES_DIR . 'dental-form-en.php');
        }
        return ob_get_clean();
    }
}

function sm_dental_insurance_init() {
    return SM_Dental_Insurance::getInstance();
}

register_activation_hook(__FILE__, 'sm_dental_insurance_activation');
register_deactivation_hook(__FILE__, 'sm_dental_insurance_deactivation');
add_action('plugins_loaded', 'sm_dental_insurance_init');