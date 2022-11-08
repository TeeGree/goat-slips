CREATE TABLE [dbo].[FavoriteTimeSlip]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] VARCHAR(50) NOT NULL,
	[UserId] INT NOT NULL, 
    [ProjectId] INT NOT NULL, 
    [TaskId] INT NULL, 
    [LaborCodeId] INT NULL,
    CONSTRAINT [FK_FavoriteTimeSlip_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
    CONSTRAINT [FK_FavoriteTimeSlip_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id]),
    CONSTRAINT [FK_FavoriteTimeSlip_Task] FOREIGN KEY ([TaskId]) REFERENCES [Task]([Id]),
    CONSTRAINT [FK_FavoriteTimeSlip_LaborCode] FOREIGN KEY ([LaborCodeId]) REFERENCES [LaborCode]([Id]),
    CONSTRAINT [UC_FavoriteTimeSlip] UNIQUE ([UserId], [ProjectId], [TaskId], [LaborCodeId])
)
