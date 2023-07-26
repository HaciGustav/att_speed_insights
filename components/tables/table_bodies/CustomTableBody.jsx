import TableBody from "@mui/material/TableBody";

const CustomTableBody = ({
  getTableBodyProps,
  prepareRow,
  page,
  resetResize,
  TableRow,
  handleRightClick,
}) => {
  return (
    <TableBody
      {...getTableBodyProps()}
      onContextMenu={(e) => handleRightClick(e, "body")}
    >
      {page?.map((row, i) => {
        prepareRow(row);

        return (
          <TableRow
            resetResize={resetResize}
            key={i}
            row={row}
            prepareRow={prepareRow}
          />
        );
      })}
    </TableBody>
  );
};

export default CustomTableBody;

//!BACKUP
{
  /* <TableBody
{...getTableBodyProps()}
onContextMenu={(e) => handleRightClick(e, "body")}
>
{page?.map((row, i) => {
  prepareRow(row);
  return (
    <TableRow
      resetResize={resetResize}
      key={i}
      row={row}
      prepareRow={prepareRow}
    />
  );
})}
</TableBody> */
}
/* 

 const Row = ({ index, style }) => {
    const row = page[index] || {};

    return (
      <span style={style}>
        <TableRow
          resetResize={resetResize}
          key={index}
          row={row}
          prepareRow={prepareRow}
        />
      </span>
    );
  };



<TableBody
sx={{ width: "100%", height: "100vh" }}
{...getTableBodyProps()}
onContextMenu={(e) => handleRightClick(e, "body")}
>
<AutoSizer>
  {({ height, width }) => (
    <List
      height={height}
      itemCount={page.length}
      itemSize={50}
      width={width}
    >
      {Row}
    </List>
  )}
</AutoSizer>
</TableBody> */
