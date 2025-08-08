/**
 * @typedef {Object} Restaurant
 * @property {number} id
 * @property {string} external_id
 * @property {string} name
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} contact
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} minimum_order_amount
 * @property {number} minimum_prep_time
 * @property {number} delivery_charge
 * @property {number} packaging_charge
 * @property {string} merchant_vpa
 * @property {string} merchant_name
 * @property {string} menu_sharing_code
 * @property {'PAY_AND_PLACE'|'PAY_AT_END'} payment_acceptance_type
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} external_id
 * @property {number} restaurant_id
 * @property {string} name
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} AddOnGroup
 * @property {number} id
 * @property {string} external_id
 * @property {string} name
 * @property {number} min_selection
 * @property {number} max_selection
 * @property {AddOnItem[]} items
 */

/**
 * @typedef {Object} AddOnItem
 * @property {number} id
 * @property {string} external_id
 * @property {number} addon_group_id
 * @property {string} name
 * @property {number} price
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} Variation
 * @property {number} id
 * @property {string} external_id
 * @property {number} item_id
 * @property {string} name
 * @property {number} price
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} MenuItem
 * @property {number} id
 * @property {string} external_id
 * @property {number} restaurant_id
 * @property {number} category_id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} image_url
 * @property {boolean} is_recommend
 * @property {boolean} is_active
 * @property {Variation[]} variations
 * @property {AddOnGroup[]} addon_groups
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {number} cart_id
 * @property {number} item_id
 * @property {number|null} variation_id
 * @property {Array<{id: number, quantity: number}>} addon_items
 * @property {number} quantity
 * @property {number} price
 * @property {MenuItem} item
 * @property {Variation} [selected_variation]
 * @property {AddOnItem[]} selected_addons
 */

/**
 * @typedef {Object} Cart
 * @property {number} id
 * @property {number|null} user_id
 * @property {string|null} session_id
 * @property {number} restaurant_id
 * @property {boolean} is_finalized
 * @property {number|null} order_group_id
 * @property {CartItem[]} items
 * @property {number} total_amount
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {'ADMIN' | 'CUSTOMER' | 'RESTAURANT_OWNER'} role
 * @property {string} name
 * @property {string} email
 * @property {string} phone_number
 */

/**
 * @typedef {Object} OrderGroup
 * @property {number} id
 * @property {number} restaurant_id
 * @property {number|null} table_id
 * @property {'TABLE'|'DELIVERY'|'PICKUP'} location_type
 * @property {Object|null} location_details
 * @property {string|null} qr_code
 * @property {'pending'|'processing'|'paid'|'failed'|'refunded'} payment_status
 * @property {'active'|'pending_payment'|'closed'} group_status
 * @property {number} total_amount
 * @property {string|null} payment_method
 * @property {string|null} payment_reference
 * @property {string|null} session_id
 * @property {Order[]} orders
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {number} user_id
 * @property {number} restaurant_id
 * @property {number|null} order_group_id
 * @property {'pending'|'pending_payment'|'confirmed'|'preparing'|'ready'|'delivered'|'cancelled'} order_status
 * @property {'pending'|'processing'|'paid'|'failed'|'refunded'} payment_status
 * @property {number} total_amount
 * @property {string|null} payment_method
 * @property {string|null} payment_reference
 * @property {OrderItem[]} items
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} id
 * @property {number} order_id
 * @property {number} item_id
 * @property {number|null} variation_id
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} add_ons_total
 * @property {'ADDED'|'SENT_TO_KITCHEN'|'SERVED'|'CANCELLED'} status
 * @property {AddOnItem[]} addons
 */

export {}; // This ensures this file is treated as a module 