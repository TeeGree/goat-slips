CREATE TRIGGER [OnTimeSlipUpdate]
	ON [dbo].[TimeSlip]
	FOR UPDATE
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
			'U',
			d.[Hours], 
			d.[Minutes], 
			d.[Date], 
			d.[UserId], 
			d.[ProjectId], 
			d.[TaskId], 
			d.[LaborCodeId], 
			d.[Description],
			t.[Hours], 
			t.[Minutes], 
			t.[Date], 
			t.[UserId], 
			t.[ProjectId], 
			t.[TaskId], 
			t.[LaborCodeId], 
			t.[Description]
		FROM deleted d
		JOIN TimeSlip t
			ON t.Id = d.Id
	END
