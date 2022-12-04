CREATE TABLE [dbo].[QueryLaborCode]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[QueryId] INT NOT NULL, 
	[LaborCodeId] INT NOT NULL, 
	CONSTRAINT [FK_QueryLaborCode_Query] FOREIGN KEY ([QueryId]) REFERENCES [Query]([Id]),
	CONSTRAINT [FK_QueryLaborCode_LaborCode] FOREIGN KEY ([LaborCodeId]) REFERENCES [LaborCode]([Id]),
)
