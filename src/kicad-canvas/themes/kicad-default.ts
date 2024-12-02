/*
    Copyright (c) 2023 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { Color } from "./color"

export interface Theme {
    name: string
    friendly_name: string
    board: BoardTheme
    schematic: SchematicTheme
}

export interface BaseTheme {
    background: Color
    grid: Color
    grid_axes: Color
}

export interface BoardTheme extends BaseTheme {
    anchor: Color
    aux_items: Color
    b_adhes: Color
    b_crtyd: Color
    b_fab: Color
    b_mask: Color
    b_paste: Color
    b_silks: Color
    background: Color
    cmts_user: Color
    copper: {
        b: Color
        f: Color
        in1: Color
        in10: Color
        in11: Color
        in12: Color
        in13: Color
        in14: Color
        in15: Color
        in16: Color
        in17: Color
        in18: Color
        in19: Color
        in2: Color
        in20: Color
        in21: Color
        in22: Color
        in23: Color
        in24: Color
        in25: Color
        in26: Color
        in27: Color
        in28: Color
        in29: Color
        in3: Color
        in30: Color
        in4: Color
        in5: Color
        in6: Color
        in7: Color
        in8: Color
        in9: Color
    }
    cursor: Color
    drc_error: Color
    drc_exclusion: Color
    drc_warning: Color
    dwgs_user: Color
    eco1_user: Color
    eco2_user: Color
    edge_cuts: Color
    f_adhes: Color
    f_crtyd: Color
    f_fab: Color
    f_mask: Color
    f_paste: Color
    f_silks: Color
    footprint_text_invisible: Color
    grid: Color
    grid_axes: Color
    margin: Color
    no_connect: Color
    pad_plated_hole: Color
    pad_through_hole: Color
    non_plated_hole: Color
    ratsnest: Color
    user_1: Color
    user_2: Color
    user_3: Color
    user_4: Color
    user_5: Color
    user_6: Color
    user_7: Color
    user_8: Color
    user_9: Color
    via_blind_buried: Color
    via_hole: Color
    via_micro: Color
    via_through: Color
    worksheet: Color
}

export interface SchematicTheme extends BaseTheme {
    anchor: Color
    aux_items: Color
    brightened: Color
    bus: Color
    bus_junction: Color
    component_body: Color
    component_outline: Color
    cursor: Color
    erc_error: Color
    erc_warning: Color
    fields: Color
    hidden: Color
    junction: Color
    label_global: Color
    label_hier: Color
    label_local: Color
    no_connect: Color
    note: Color
    pin: Color
    pin_name: Color
    pin_number: Color
    reference: Color
    shadow: Color
    sheet: Color
    sheet_background: Color
    sheet_fields: Color
    sheet_filename: Color
    sheet_label: Color
    sheet_name: Color
    value: Color
    wire: Color
    worksheet: Color
}

export type BoardOrSchematicTheme = BoardTheme | SchematicTheme

const theme: Theme = {
    name: "kicad",
    friendly_name: "KiCAD",
    board: {
        anchor: Color.from_css("rgb(255, 38, 226)"),
        aux_items: Color.from_css("rgb(255, 255, 255)"),
        b_adhes: Color.from_css("rgb(0, 0, 132)"),
        b_crtyd: Color.from_css("rgb(38, 233, 255)"),
        b_fab: Color.from_css("rgb(88, 93, 132)"),
        b_mask: Color.from_css("rgba(2, 255, 238, 0.400)"),
        b_paste: Color.from_css("rgba(0, 194, 194, 0.902)"),
        b_silks: Color.from_css("rgb(232, 178, 167)"),
        background: Color.from_css("rgb(0, 16, 35)"),
        cmts_user: Color.from_css("rgb(89, 148, 220)"),
        // conflicts_shadow: Color.from_css("rgba(255, 0, 5, 0.502)"),
        copper: {
            b: Color.from_css("rgb(77, 127, 196)"),
            f: Color.from_css("rgb(200, 52, 52)"),
            in1: Color.from_css("rgb(127, 200, 127)"),
            in10: Color.from_css("rgb(237, 124, 51)"),
            in11: Color.from_css("rgb(91, 195, 235)"),
            in12: Color.from_css("rgb(247, 111, 142)"),
            in13: Color.from_css("rgb(167, 165, 198)"),
            in14: Color.from_css("rgb(40, 204, 217)"),
            in15: Color.from_css("rgb(232, 178, 167)"),
            in16: Color.from_css("rgb(242, 237, 161)"),
            in17: Color.from_css("rgb(237, 124, 51)"),
            in18: Color.from_css("rgb(91, 195, 235)"),
            in19: Color.from_css("rgb(247, 111, 142)"),
            in2: Color.from_css("rgb(206, 125, 44)"),
            in20: Color.from_css("rgb(167, 165, 198)"),
            in21: Color.from_css("rgb(40, 204, 217)"),
            in22: Color.from_css("rgb(232, 178, 167)"),
            in23: Color.from_css("rgb(242, 237, 161)"),
            in24: Color.from_css("rgb(237, 124, 51)"),
            in25: Color.from_css("rgb(91, 195, 235)"),
            in26: Color.from_css("rgb(247, 111, 142)"),
            in27: Color.from_css("rgb(167, 165, 198)"),
            in28: Color.from_css("rgb(40, 204, 217)"),
            in29: Color.from_css("rgb(232, 178, 167)"),
            in3: Color.from_css("rgb(79, 203, 203)"),
            in30: Color.from_css("rgb(242, 237, 161)"),
            in4: Color.from_css("rgb(219, 98, 139)"),
            in5: Color.from_css("rgb(167, 165, 198)"),
            in6: Color.from_css("rgb(40, 204, 217)"),
            in7: Color.from_css("rgb(232, 178, 167)"),
            in8: Color.from_css("rgb(242, 237, 161)"),
            in9: Color.from_css("rgb(141, 203, 129)"),
        },
        cursor: Color.from_css("rgb(255, 255, 255)"),
        drc_error: Color.from_css("rgba(215, 91, 107, 0.800)"),
        drc_exclusion: Color.from_css("rgba(255, 255, 255, 0.800)"),
        drc_warning: Color.from_css("rgba(255, 208, 66, 0.800)"),
        dwgs_user: Color.from_css("rgb(194, 194, 194)"),
        eco1_user: Color.from_css("rgb(180, 219, 210)"),
        eco2_user: Color.from_css("rgb(216, 200, 82)"),
        edge_cuts: Color.from_css("rgb(208, 210, 205)"),
        f_adhes: Color.from_css("rgb(132, 0, 132)"),
        f_crtyd: Color.from_css("rgb(255, 38, 226)"),
        f_fab: Color.from_css("rgb(175, 175, 175)"),
        f_mask: Color.from_css("rgba(216, 100, 255, 0.400)"),
        f_paste: Color.from_css("rgba(180, 160, 154, 0.902)"),
        f_silks: Color.from_css("rgb(242, 237, 161)"),
        footprint_text_invisible: Color.from_css("rgb(132, 132, 132)"),
        grid: Color.from_css("rgb(132, 132, 132)"),
        grid_axes: Color.from_css("rgb(194, 194, 194)"),
        // locked_shadow: Color.from_css("rgba(255, 38, 226, 0.502)"),
        margin: Color.from_css("rgb(255, 38, 226)"),
        no_connect: Color.from_css("rgb(0, 0, 132)"),
        pad_plated_hole: Color.from_css("rgb(194, 194, 0)"),
        pad_through_hole: Color.from_css("rgb(227, 183, 46)"),
        // page_limits: Color.from_css("rgb(132, 132, 132)"),
        non_plated_hole: Color.from_css("rgb(26, 196, 210)"),
        // plated_hole: Color.from_css("rgb(26, 196, 210)"),
        ratsnest: Color.from_css("rgba(245, 255, 213, 0.702)"),
        user_1: Color.from_css("rgb(194, 194, 194)"),
        user_2: Color.from_css("rgb(89, 148, 220)"),
        user_3: Color.from_css("rgb(180, 219, 210)"),
        user_4: Color.from_css("rgb(216, 200, 82)"),
        user_5: Color.from_css("rgb(194, 194, 194)"),
        user_6: Color.from_css("rgb(89, 148, 220)"),
        user_7: Color.from_css("rgb(180, 219, 210)"),
        user_8: Color.from_css("rgb(216, 200, 82)"),
        user_9: Color.from_css("rgb(232, 178, 167)"),
        via_blind_buried: Color.from_css("rgb(187, 151, 38)"),
        via_hole: Color.from_css("rgb(227, 183, 46)"),
        via_micro: Color.from_css("rgb(0, 132, 132)"),
        via_through: Color.from_css("rgb(236, 236, 236)"),
        worksheet: Color.from_css("rgb(200, 114, 171)"),
    },
    schematic: {
        anchor: Color.from_css("rgb(0, 0, 255)"),
        aux_items: Color.from_css("rgb(0, 0, 0)"),
        background: Color.from_css("rgb(245, 244, 239)"),
        brightened: Color.from_css("rgb(255, 0, 255)"),
        bus: Color.from_css("rgb(0, 0, 132)"),
        bus_junction: Color.from_css("rgb(0, 0, 132)"),
        component_body: Color.from_css("rgb(255, 255, 194)"),
        component_outline: Color.from_css("rgb(132, 0, 0)"),
        cursor: Color.from_css("rgb(15, 15, 15)"),
        erc_error: Color.from_css("rgba(230, 9, 13, 0.800)"),
        // erc_exclusion: Color.from_css("rgba(94, 194, 194, 0.800)"),
        erc_warning: Color.from_css("rgba(209, 146, 0, 0.800)"),
        fields: Color.from_css("rgb(132, 0, 132)"),
        grid: Color.from_css("rgb(181, 181, 181)"),
        grid_axes: Color.from_css("rgb(0, 0, 132)"),
        hidden: Color.from_css("rgb(94, 194, 194)"),
        // hovered: Color.from_css("rgb(0, 0, 255)"),
        junction: Color.from_css("rgb(0, 150, 0)"),
        label_global: Color.from_css("rgb(132, 0, 0)"),
        label_hier: Color.from_css("rgb(114, 86, 0)"),
        label_local: Color.from_css("rgb(15, 15, 15)"),
        // netclass_flag: Color.from_css("rgb(72, 72, 72)"),
        no_connect: Color.from_css("rgb(0, 0, 132)"),
        note: Color.from_css("rgb(0, 0, 194)"),
        // note_background: Color.from_css("rgba(0, 0, 0, 0.000)"),
        // page_limits: Color.from_css("rgb(181, 181, 181)"),
        pin: Color.from_css("rgb(132, 0, 0)"),
        pin_name: Color.from_css("rgb(0, 100, 100)"),
        pin_number: Color.from_css("rgb(169, 0, 0)"),
        // private_note: Color.from_css("rgb(72, 72, 255)"),
        reference: Color.from_css("rgb(0, 100, 100)"),
        shadow: Color.from_css("rgba(199, 235, 255, 0.800)"),
        sheet: Color.from_css("rgb(132, 0, 0)"),
        sheet_background: Color.from_css("rgba(255, 255, 255, 0.000)"),
        sheet_fields: Color.from_css("rgb(132, 0, 132)"),
        sheet_filename: Color.from_css("rgb(114, 86, 0)"),
        sheet_label: Color.from_css("rgb(0, 100, 100)"),
        sheet_name: Color.from_css("rgb(0, 100, 100)"),
        value: Color.from_css("rgb(0, 100, 100)"),
        wire: Color.from_css("rgb(0, 150, 0)"),
        worksheet: Color.from_css("rgb(132, 0, 0)"),
    },
}

export default theme
