-- dbt Modeling Code for MetricMind Agentic Semantic BI Engine

-- File: models/staging/stg_sales_transactions.sql
-- Description: Ingests raw mock transaction data from Snowflake and standardizes types.

with raw_source as (
    select * from {{ source('raw_data', 'metricmind_raw_transactions') }}
)

select
    cast(transaction_id as integer) as transaction_id,
    cast(date as date) as transaction_date,
    cast(region as varchar) as region,
    cast(product_category as varchar) as product_category,
    cast(revenue as decimal(18,2)) as revenue,
    cast(material_cost as decimal(18,2)) as material_cost,
    cast(shipping_cost as decimal(18,2)) as shipping_cost
from raw_source;


-- File: models/marts/fct_sales.sql
-- Description: Core analytical fact table containing financial dimensions and calculated pre-governed metrics.

with staging as (
    select * from {{ ref('stg_sales_transactions') }}
)

select
    transaction_id,
    transaction_date,
    
    -- Date transformations for time-series and reporting granularities
    date_trunc('month', transaction_date) as transaction_month,
    concat(year(transaction_date), '-Q', quarter(transaction_date)) as fiscal_quarter,
    
    region,
    product_category,
    
    -- Baseline governed measures
    revenue,
    material_cost,
    shipping_cost,
    
    -- Derived physical measures for warehouse caching and performance optimization
    (revenue - material_cost - shipping_cost) as gross_profit,
    
    -- Cost-ratio calculations
    case 
        when revenue > 0 then (material_cost / revenue) 
        else 0 
    end as material_cost_ratio,
    case 
        when revenue > 0 then (shipping_cost / revenue) 
        else 0 
    end as shipping_cost_ratio
from staging;
