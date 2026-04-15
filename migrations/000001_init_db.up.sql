CREATE TABLE IF NOT EXISTS roles (
   "id_roles" SERIAL PRIMARY KEY,
   "name_roles" VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
   "id_user" SERIAL PRIMARY KEY,
   "roles_id" INT,
   "fullname" VARCHAR(100) NOT NULL,
   "email" VARCHAR(100) UNIQUE NOT NULL,  
   "password" VARCHAR(255) NOT NULL,
   "address" TEXT,
   "phone" VARCHAR(20),
   "profile_picture" VARCHAR(255),
   CONSTRAINT "fk_user_roles" FOREIGN KEY ("roles_id") REFERENCES "roles"("id_roles") ON DELETE SET NULL
); 

CREATE TABLE IF NOT EXISTS category (
   "id_category" SERIAL PRIMARY KEY,
   "name_category" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
   "id_product" SERIAL PRIMARY KEY,
   "name" VARCHAR(150) NOT NULL,
   "desc" TEXT,
   "price" INT NOT NULL,
   "quantity" INT DEFAULT 0,
   "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products_category (
   "product_id" INT,
   "category_id" INT,
   PRIMARY KEY ("product_id", "category_id"), 
   CONSTRAINT "fk_pc_product" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE,
   CONSTRAINT "fk_pc_category" FOREIGN KEY ("category_id") REFERENCES "category"("id_category") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_images (
   "id_image" SERIAL PRIMARY KEY,
   "product_id" INT,
   "path" VARCHAR(255) NOT NULL,
   CONSTRAINT "fk_img_product" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variant (
   "id_variant" SERIAL PRIMARY KEY,
   "product_id" INT,
   "variant_name" VARCHAR(100),
   "additional_price" INT DEFAULT 0,
   CONSTRAINT "fk_var_product" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_size (
   "id_size" SERIAL PRIMARY KEY,
   "product_id" INT,
   "size_name" VARCHAR(50),
   "additional_price" INT DEFAULT 0,
   CONSTRAINT "fk_size_product" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discount (
   "id_discount" SERIAL PRIMARY KEY,
   "product_id" INT,
   "discount_rate" FLOAT NOT NULL,
   "description" VARCHAR(255),
   "is_flash_sale" BOOLEAN DEFAULT FALSE,
   CONSTRAINT "fk_disc_product" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart (
   "id_cart" SERIAL PRIMARY KEY,
   "user_id" INT,
   "product_id" INT,
   "variant_id" INT,
   "size_id" INT,
   "quantity" INT NOT NULL DEFAULT 1,
   CONSTRAINT "fk_cart_user" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE,
   CONSTRAINT "fk_cart_prod" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE,
   CONSTRAINT "fk_cart_var" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id_variant"),
   CONSTRAINT "fk_cart_size" FOREIGN KEY ("size_id") REFERENCES "product_size"("id_size")
);

CREATE TABLE IF NOT EXISTS "transaction" ( 
   "id_transaction" SERIAL PRIMARY KEY,
   "user_id" INT,
   "transaction_number" VARCHAR(50),
   "delivery_method" VARCHAR(50),
   "subtotal" INT NOT NULL,
   "total" INT NOT NULL,
   "status" VARCHAR(50) DEFAULT 'Pending',
   "payment_method" VARCHAR(50),
   "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT "fk_trans_user" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transaction_product (
   "id_trans_prod" SERIAL PRIMARY KEY,
   "transaction_id" INT,
   "product_id" INT,
   "quantity" INT NOT NULL,
   "size" VARCHAR(50),
   "variant" VARCHAR(100),  
   "price" INT NOT NULL,
   CONSTRAINT "fk_tp_trans" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id_transaction") ON DELETE CASCADE,
   CONSTRAINT "fk_tp_prod" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS review (
   "id_review" SERIAL PRIMARY KEY,
   "user_id" INT,
   "product_id" INT,
   "messages" TEXT,
   "rating" FLOAT CHECK ("rating" >= 1 AND rating <= 5),
   CONSTRAINT "fk_rev_user" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE,
   CONSTRAINT "fk_rev_prod" FOREIGN KEY ("product_id") REFERENCES "products"("id_product") ON DELETE CASCADE
);