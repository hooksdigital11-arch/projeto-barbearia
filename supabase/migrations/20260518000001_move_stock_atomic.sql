-- Atomic stock movement to prevent race conditions.
-- Locks the inventory row, validates stock, and updates quantity in a single transaction.
CREATE OR REPLACE FUNCTION move_stock_atomic(
  p_product_id      uuid,
  p_organization_id uuid,
  p_direction       text,     -- 'in' | 'out'
  p_quantity        integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current integer;
  v_new     integer;
BEGIN
  SELECT quantity
    INTO v_current
    FROM inventory
   WHERE id = p_product_id
     AND organization_id = p_organization_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'product_not_found';
  END IF;

  IF p_direction = 'in' THEN
    v_new := v_current + p_quantity;
  ELSE
    v_new := v_current - p_quantity;
  END IF;

  IF v_new < 0 THEN
    RAISE EXCEPTION 'insufficient_stock: current=%, requested=%', v_current, p_quantity;
  END IF;

  UPDATE inventory
     SET quantity = v_new
   WHERE id = p_product_id
     AND organization_id = p_organization_id;

  RETURN v_new;
END;
$$;

-- Only service role may call this function directly
REVOKE ALL ON FUNCTION move_stock_atomic(uuid, uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION move_stock_atomic(uuid, uuid, text, integer) TO service_role;
