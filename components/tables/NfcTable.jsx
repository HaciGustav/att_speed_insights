"use client";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "../Pagination";
import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/system/Box";
import NfcFilter from "../filters/NfcFilter";
import ContextMenu from "../ContextMenu";
import useContextMenu from "../../hooks/useContextMenu";
import DownloadCSV from "../DownloadCSV";
import { tableStyles } from "@/styles/table_styles";
import NfcTableRow from "../table_rows/NfcTableRow";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { searchNfcTag } from "@/helpers/searchFunctions";
import {
  useBlockLayout,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import styles from "./table_styles.module.css";
import UndoIcon from "@mui/icons-material/Undo";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useColumns from "@/hooks/useColumns";
import Loading from "../Loading";
import ErrorModal from "../modals/ErrorModal";
import { useSelector } from "react-redux";
import CustomTableHead from "./table_heads/CustomTableHead";
import CustomTableBody from "./table_bodies/CustomTableBody";
import useTableUtils from "@/hooks/table_hooks/useTableUtils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const initalContextMenu = {
  show: false,
  x: 0,
  y: 0,
};

const NfcTable = ({ data }) => {
  const tableRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(initalContextMenu);
  const { NFC_TABLE_COLUMNS } = useColumns();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState(data);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [resetResize, setResetResize] = useState(false);
  const { error, errorMsg } = useSelector((state) => state.atina);
  //? Table Utilities START
  //#region
  const tableColumns = useMemo(() => NFC_TABLE_COLUMNS, []);
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    [tableRef]
  );

  const {
    headerGroups,
    getTableProps,
    getTableBodyProps,
    page,
    canPreviousPage,
    canNextPage,
    setPageSize,
    gotoPage,
    pageOptions,
    nextPage,
    previousPage,
    prepareRow,
    allColumns,
    resetResizing,
    state,
  } = useTableUtils(tableColumns, allData, defaultColumn, hiddenColumns);
  //#endregion
  // Table Utilities END

  // ===Table Filter START===
  const initialFilterparams = {
    id: null,
    tagID: null,
    desc: null,
    ItemType: "",
    nfcData: null,
    itemID: null,
    timeFrom: null,
    timeTo: null,
    createdTo: null,
    createdFrom: null,
  };
  const [filterVal, setFilterVal] = useState(initialFilterparams);

  const handleFilter = (e) => {
    e.preventDefault();

    const adapterDayjs = new AdapterDayjs();
    const isDateFromValid = adapterDayjs.isValid(filterVal.createdFrom);
    const isDateToValid = adapterDayjs.isValid(filterVal.createdTo);
    let cFrom = isDateFromValid
      ? new Date(filterVal.createdFrom).toLocaleDateString("sv") +
        "T" +
        (filterVal.timeFrom ? filterVal.timeFrom : "00:00:00")
      : null;
    let cTo = isDateToValid
      ? new Date(filterVal.createdTo).toLocaleDateString("sv") +
        "T" +
        (filterVal.timeTo ? filterVal.timeTo : "00:00:00")
      : null;
    const currentValues = {
      ...filterVal,
      createdFrom: cFrom,
      createdTo: cTo,
    };

    // setLoading(true);
    searchNfcTag(currentValues).then((res) => {
      let editedRes = res?.map((x) => ({
        ...x?.item,
        createdDate: x?.createdDate,
      }));
      console.log(editedRes);
      setAllData(editedRes);
      setLoading(false);
    });
  };
  const handleReset = () => {
    setFilterVal(initialFilterparams);
  };

  // ===Table Filter END===

  const { handleRightClick } = useContextMenu(contextMenu, setContextMenu);

  useEffect(() => {
    const x = localStorage.getItem("hiddenColumns/nfc-tags");
    setHiddenColumns(JSON.parse(x));
  }, []);

  return (
    <>
      {loading && <Loading />}
      {error && <ErrorModal error={errorMsg} />}
      {contextMenu.show && (
        <ContextMenu
          allColumns={allColumns}
          X={contextMenu.x}
          Y={contextMenu.y}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          // setOpenModal={""}
          tableColumns={tableColumns}
          tableRef={tableRef}
          state={state}
        />
      )}
      <TableContainer
        component={Paper}
        ref={tableRef}
        sx={{
          ...tableStyles.tableContainer,
          // maxWidth: "93vw",
          // maxHeight: "80vh",
          // overflow: "auto",
        }}
      >
        <NfcFilter
          handleReset={handleReset}
          handleFilter={handleFilter}
          filterVal={filterVal}
          setFilterVal={setFilterVal}
        />
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Pagination
            data={allData}
            nextPage={nextPage}
            previousPage={previousPage}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageOptions={pageOptions}
            state={state}
            setPageSize={setPageSize}
            gotoPage={gotoPage}
          />

          <Tooltip title="Spaltengröße rückgängig machen" arrow>
            <IconButton
              onClick={() => {
                resetResizing();
                setResetResize(!resetResize);
              }}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <DownloadCSV rawData={allData} fileName={"nfc_tags"} />
        </div>
        <Table
          {...getTableProps()}
          className="table"
          sx={{ minWidth: 650 }}
          aria-label="simple table"
        >
          <CustomTableHead
            headerGroups={headerGroups}
            resetResize={resetResize}
            setResetResize={setResetResize}
            handleRightClick={handleRightClick}
          />

          <CustomTableBody
            resetResize={resetResize}
            getTableBodyProps={getTableBodyProps}
            prepareRow={prepareRow}
            page={page}
            TableRow={NfcTableRow}
            handleRightClick={handleRightClick}
          />
        </Table>
      </TableContainer>
    </>
  );
};

export default NfcTable;
