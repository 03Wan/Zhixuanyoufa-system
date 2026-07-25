-- Repair legacy report-template strings that were saved after UTF-8 text was
-- incorrectly decoded as GBK. Restrict the repair to known mojibake markers so
-- correctly encoded templates are never changed.
CREATE OR REPLACE FUNCTION repair_report_template_mojibake(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(convert_to(value, 'GBK'), 'UTF8');
EXCEPTION WHEN OTHERS THEN
  RETURN value;
END;
$$ LANGUAGE plpgsql;

UPDATE "ReportTemplate"
SET "name" = repair_report_template_mojibake("name")
WHERE "name" LIKE '%鏍%' OR "name" LIKE '%妯%' OR "name" LIKE '%鎶ュ憡%';

UPDATE "ReportTemplate"
SET "schema" = jsonb_set(
  "schema",
  '{sections}',
  COALESCE((
    SELECT jsonb_agg(to_jsonb(repair_report_template_mojibake(section)))
    FROM jsonb_array_elements_text("schema"->'sections') AS section
  ), '[]'::jsonb)
)
WHERE "schema" ? 'sections'
  AND (
    "schema"::text LIKE '%灏%' OR "schema"::text LIKE '%鍩%' OR "schema"::text LIKE '%璇%' OR
    "schema"::text LIKE '%椋%' OR "schema"::text LIKE '%寤%' OR "schema"::text LIKE '%澶%'
  );

DROP FUNCTION repair_report_template_mojibake(TEXT);
