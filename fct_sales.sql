{{ config(materialized='table') }}

SELECT
    TRANSACTION_ID,
    DATE,
    QUARTER,
    REGION,
    PRODUCT_CATEGORY,
    REVENUE,
    MATERIAL_COST,
    SHIPPING_COST,

    REVENUE - MATERIAL_COST - SHIPPING_COST AS GROSS_PROFIT,

    ROUND(
        (REVENUE - MATERIAL_COST - SHIPPING_COST)
        / NULLIF(REVENUE, 0) * 100,
        2
    ) AS GROSS_MARGIN_PERCENT

FROM {{ ref('stg_sales_transactions') }}