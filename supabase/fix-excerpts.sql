-- ============================================================
-- One-time cleanup: strip &nbsp; / entities / stray whitespace from
-- existing blog excerpts (the card preview text). Run in the Supabase
-- SQL Editor. Safe to re-run.
--
-- Fixes the "&nbsp; showing in card preview" issue at the DATA level, so
-- it's clean even on an older deployed frontend build.
-- ============================================================

update blogs
set excerpt = btrim(
  regexp_replace(
    regexp_replace(
      replace(
        replace(
          replace(excerpt, '&amp;nbsp;', ' '),  -- double-encoded nbsp
          '&nbsp;', ' '                          -- nbsp entity
        ),
        chr(160), ' '                            -- literal non-breaking space
      ),
      '&[a-z0-9#]+;', ' ', 'gi'                  -- any other &entity;
    ),
    '\s+', ' ', 'g'                              -- collapse whitespace
  )
)
where excerpt is not null and excerpt <> '';
