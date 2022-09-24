CREATE TABLE [dbo].[TimeSlip]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [Hours] TINYINT NOT NULL DEFAULT 0, 
    [Minutes] TINYINT NOT NULL DEFAULT 0, 
    [Date] DATE NOT NULL, 
    [UserId] INT NOT NULL, 
    [ProjectId] INT NOT NULL, 
    [TaskId] INT NULL, 
    [LaborCodeId] INT NULL, 
    CONSTRAINT [CK_TimeSlip_Hours] CHECK ([Hours] <= 24), 
    CONSTRAINT [CK_TimeSlip_Minutes] CHECK ([Minutes] <= 59),
    CONSTRAINT [CK_TimeSlip_HoursMinutes] CHECK (([Hours] * 60) + [Minutes] <= 1440), 
    CONSTRAINT [FK_TimeSlip_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
    CONSTRAINT [FK_TimeSlip_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id]),
    CONSTRAINT [FK_TimeSlip_Task] FOREIGN KEY ([TaskId]) REFERENCES [Task]([Id]),
    CONSTRAINT [FK_TimeSlip_LaborCode] FOREIGN KEY ([LaborCodeId]) REFERENCES [LaborCode]([Id]),
)
