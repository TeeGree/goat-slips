CREATE TRIGGER [OnTimeSlipCreate]
	ON [dbo].[TimeSlip]
	FOR INSERT
	AS
	BEGIN
		SET NOCOUNT ON

		INSERT INTO TimeSlipLog
		(
			[UpdateType],
			[OldHours], 
			[OldMinutes], 
			[OldDate], 
			[OldUserId], 
			[OldProjectId], 
			[OldTaskId], 
			[OldLaborCodeId], 
			[OldDescription],
			[NewHours], 
			[NewMinutes], 
			[NewDate], 
			[NewUserId], 
			[NewProjectId], 
			[NewTaskId], 
			[NewLaborCodeId], 
			[NewDescription]
		)
		SELECT
			'C',
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL, 
			NULL,
			i.[Hours], 
			i.[Minutes], 
			i.[Date], 
			i.[UserId], 
			i.[ProjectId], 
			i.[TaskId], 
			i.[LaborCodeId], 
			i.[Description]
		FROM inserted i
	END
