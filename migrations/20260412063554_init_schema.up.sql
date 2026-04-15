SELECT setval(
    pg_get_serial_sequence('"transaction"', 'id_transaction'), 
    COALESCE(max(id_transaction), 1), 
    max(id_transaction) IS NOT null
) FROM "transaction";