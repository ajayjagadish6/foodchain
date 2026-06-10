ALTER TABLE donations
  ADD COLUMN serving_count    INT           NULL,
  ADD COLUMN pickup_start     TIME          NULL,
  ADD COLUMN pickup_end       TIME          NULL,
  ADD COLUMN dietary_notes    VARCHAR(255)  NULL;

ALTER TABLE requests
  ADD COLUMN serving_count    INT           NULL,
  ADD COLUMN dietary_notes    VARCHAR(255)  NULL;
