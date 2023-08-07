import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/system/Box";
import IconButton from "@mui/material/IconButton";
import ContextMenu from "../ContextMenu";
import useContextMenu from "../../hooks/useContextMenu";
import DownloadCSV from "../DownloadCSV";
import { tableStyles } from "@/styles/table_styles";
import ItemsTableRow from "../table_rows/ItemsTableRow";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ItemsModal from "../modals/ItemsModal";
import ItemsFilter from "../filters/ItemsFilter";
import { searchItems } from "@/helpers/searchFunctions";
import useColumns from "../../hooks/useColumns";
import UndoIcon from "@mui/icons-material/Undo";
import Tooltip from "@mui/material/Tooltip";
import ErrorModal from "../modals/ErrorModal";
import Loading from "../Loading";
import CustomTableHead from "./table_heads/CustomTableHead";
import CustomTableBody from "./table_bodies/CustomTableBody";
import useTableUtils from "@/hooks/table_hooks/useTableUtils";
import useFilters from "@/hooks/useFilters";
import usePagination from "@/hooks/usePagination";
import SSR_Pagination from "../SSR_Pagination";
import useAtinaCalls from "@/hooks/useAtinaCalls";
import Loading_Icon from "../Loading_Icon";

const initalContextMenu = {
  show: false,
  x: 0,
  y: 0,
};

const ItemsTable = ({}) => {
  const tableRef = useRef(null);
  const {
    ITEM_TABLE_ORDER_COLUMNS,
    ITEM_TABLE_METER_COLUMNS,
    ITEM_TABLE_VEHICLE_COLUMNS,
  } = useColumns();

  const { user } = useSelector((state) => state.settings);

  const [allData, setAllData] = useState([]);
  const [type, setType] = useState("Order");
  const [resetResize, setResetResize] = useState(false);
  const [contextMenu, setContextMenu] = useState(initalContextMenu);
  const [openItemsModal, setOpenItemsModal] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);

  //! Items Data and Relevants ▼▼▼▼▼▼
  const { errorMsg, error, atinaItems, loading } = useSelector(
    (state) => state.atina
  );

  //! Pagination, Sorting and Filtering State ▼▼▼▼▼▼
  const { paginationParams, sortingParams, filterParams, searchTrigger } =
    useSelector((state) => state.tableUtils.items);

  //#region //! Custom Hooks ▼▼▼▼▼▼
  const { getAtinaItemsData } = useAtinaCalls();
  const { filterItems, resetFilter } = useFilters();
  const { handleSortParams, makeUrlParams, handlePaginationParams } =
    usePagination("items");

  //#endregion //! Custom Hooks ▲▲▲▲▲▲

  //#region Table Utilities START

  const defaultColumn = useMemo(
    () => ({
      minWidth: 100,
      width: 140,
      maxWidth: 400,
    }),
    []
  );
  const tableColumns = useMemo(() => {
    if (type === "Order") {
      return ITEM_TABLE_ORDER_COLUMNS;
    } else if (type === "Meter") {
      return ITEM_TABLE_METER_COLUMNS;
    } else if (type === "Vehicle") {
      return ITEM_TABLE_VEHICLE_COLUMNS;
    }
  }, [type]);
  const {
    headerGroups,
    getTableProps,
    getTableBodyProps,
    page,
    prepareRow,
    allColumns,
    resetResizing,
    state,
  } = useTableUtils(tableColumns, allData, defaultColumn, hiddenColumns);

  const { handleRightClick } = useContextMenu(contextMenu, setContextMenu);
  //#region ===Table Filter START===
  const [filterVal, setFilterVal] = useState({ itemType: "Order" });

  const handleFilter = (e) => {
    e.preventDefault();
    setType(filterVal.itemType);
    filterItems(filterVal);
    /*  // setLoading(true);
    searchItems({ ...filterVal, type }).then((res) => {
      setAllData(res.itemArray);
      // setLoading(false);
    }); */
  };

  const handleReset = () => {
    setFilterVal({ itemType: "Order" });
    resetFilter("items");
    setType("Order");
  };

  useEffect(() => {
    const params = makeUrlParams();
    getAtinaItemsData(params + filterParams);
  }, [paginationParams, sortingParams, filterParams, searchTrigger]);

  useEffect(() => {
    if (!atinaItems?.entries) return;
    setAllData(atinaItems?.entries);
  }, [atinaItems]);

  useEffect(() => {
    const x = localStorage.getItem("hiddenColumns/items");
    setHiddenColumns(JSON.parse(x));
  }, []);

  return (
    <>
      {error && <ErrorModal error={errorMsg} />}
      {/* {loading && <Loading />} */}
      <ItemsModal
        setOpenItemsModal={setOpenItemsModal}
        openItemsModal={openItemsModal}
        type={type}
      />
      {contextMenu.show && (
        <ContextMenu
          X={contextMenu.x}
          Y={contextMenu.y}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          tableColumns={tableColumns}
          allColumns={allColumns}
          setOpenModal={setOpenItemsModal}
          openItemsModal={openItemsModal}
          tableRef={tableRef}
          state={state}
        />
      )}
      <TableContainer
        ref={tableRef}
        component={Paper}
        sx={tableStyles.tableContainer}
      >
        <ItemsFilter
          handleReset={handleReset}
          handleFilter={handleFilter}
          filterVal={filterVal}
          setFilterVal={setFilterVal}
          type={type}
          setType={setType}
        />
        <div style={tableStyles.helpersWrapper}>
          <div style={{ display: "flex" }}>
            {/* <Pagination
              data={allData}
              nextPage={nextPage}
              previousPage={previousPage}
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
              pageOptions={pageOptions}
              state={state}
              setPageSize={setPageSize}
              gotoPage={gotoPage}
            /> */}
            {loading && <Loading_Icon />}
            <SSR_Pagination
              paginationParams={paginationParams}
              totalPages={atinaItems?.totalPages}
              table={"items"}
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

            <DownloadCSV rawData={allData} fileName={"items"} type={type} />

            {user?.isAdmin && (
              <Tooltip title="Neuen Datensatz anlegen" arrow>
                <IconButton onClick={() => setOpenItemsModal(true)}>
                  <AddCircleIcon
                    sx={{
                      borderRadius: "10px",
                      color: "green",
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

        <Table
          className="table"
          {...getTableProps()}
          sx={{ minWidth: 650 }}
          aria-label="simple table"
          size="small"
        >
          <CustomTableHead
            headerGroups={headerGroups}
            setResetResize={setResetResize}
            resetResize={resetResize}
            handleRightClick={handleRightClick}
            handleSortParams={handleSortParams}
            table={"items"}
          />

          <CustomTableBody
            resetResize={resetResize}
            getTableBodyProps={getTableBodyProps}
            prepareRow={prepareRow}
            page={page}
            TableRow={ItemsTableRow}
            handleRightClick={handleRightClick}
          />
        </Table>
      </TableContainer>
    </>
  );
};

export default ItemsTable;
