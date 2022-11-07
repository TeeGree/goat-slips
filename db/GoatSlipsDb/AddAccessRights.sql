IF NOT EXISTS
(
	SELECT 1
	FROM AccessRight ar
	WHERE ar.Code = 'ADMIN'
)
INSERT INTO AccessRight
VALUES
('ADMIN', 'Access to add/manage users, query timeslips, and manage time codes.');